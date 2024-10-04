from flask import Flask, request, jsonify 
from flask_cors import CORS
import os
import tempfile
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from docx import Document
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate  # Correct import for PromptTemplate


load_dotenv()

app = Flask(__name__)
CORS(app)

# Path for storing the vector store
vector_store_path = "faiss_index"

# Function to read PDF files
def read_pdf(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""  # Handle None return
    return text

# Function to read text files
def read_txt(txt_docs):
    text = ""
    for txt in txt_docs:
        text += txt.read().decode("utf-8")  # Decode bytes to string
    return text

# Function to read DOCX files
def read_docx(docx_docs):
    text = ""
    for docx in docx_docs:
        doc = Document(docx)
        for para in doc.paragraphs:
            text += para.text + "\n"  # Add line breaks
    return text

# Function to initialize the generative model
def initialize_generative_model():
    return ChatOpenAI(model="gpt-4o", temperature=0.5)

# Function to understand tone and language
def understand_tone_and_language(script_text):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    vector_store = FAISS.from_texts([script_text], embedding=embeddings)
    vector_store.save_local(vector_store_path)

# Function to generate test cases based on user input
def generate_script(user_query, generative_model):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
    new_db = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)

    # Perform similarity search
    script_docs = new_db.similarity_search(user_query)

    prompt_template = """
    You are AI Test Case Generator.
    In the context, PDD overviews along with their test cases are given to train the model.
    Extract the overview/purpose of the input provided.
    For the overview extracted generate the test case/s based on the above patterns of PDD overviews and Test Cases and return the text case/s as a response.
    Generate me strictly the test cases only, not test scripts or test Descriptions.
    Also make sure that the test case does not exceed 10 words.
    The output should be in such a way that each test case should be printed in separate lines.

    Example:
    Test cases for the Demo/Direct Exchange Order process:
    Test Case 1: Create a Demo Order from Customer Request via Email 
    Test Case 2: Initiate Direct Exchange Order for Customer Equipment Repair
    Test Case 3: Check for Duplicate Purchase Order Numbers in Demo/Direct Exchange Order
    Test Case 4: Determine Customer Partner Functions for Demo/Direct Exchange Order 
    Test Case 5: Process Free of Charge Equipment for Direct Exchange 
    Test Case 6: Handle Returns of Customer Equipment to Otsuka 

    Please provide at least 5 or more relevant SAP test cases, following the structure shown in the examples. Ensure to format them as "Test Case X: [Description]" for clarity.

    Context: \n{context}\n
    Generated Test Cases:
    """
    
    prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
    chain = load_qa_chain(generative_model, chain_type="stuff", prompt=prompt)

    response = chain({"input_documents": script_docs}, return_only_outputs=True)
    return response["output_text"]

# API endpoint to upload files and process content
@app.route('/upload', methods=['POST'])
def upload_files():
    uploaded_files = request.files.getlist('files')

    if not uploaded_files:
        return jsonify({"error": "No valid files uploaded"}), 400

    # Temporary storage for reading file content
    temp_dir = tempfile.mkdtemp()

    # Process uploaded files and store their text content
    uploaded_content = ""
    for file in uploaded_files:
        if file.filename.endswith(".pdf"):
            temp_path = os.path.join(temp_dir, file.filename)
            file.save(temp_path)
            uploaded_content += read_pdf([temp_path])
        elif file.filename.endswith(".txt"):
            uploaded_content += read_txt([file])
        elif file.filename.endswith(".docx"):
            temp_path = os.path.join(temp_dir, file.filename)
            file.save(temp_path)
            uploaded_content += read_docx([temp_path])

    if uploaded_content:
        understand_tone_and_language(uploaded_content)  # Process uploaded content
        return jsonify({"message": "Files processed and content uploaded successfully."}), 200
    else:
        return jsonify({"error": "No valid content extracted from the uploaded files."}), 400

# API endpoint to generate test cases based on uploaded content
@app.route('/query', methods=['POST'])
def generate_test_cases():
    # Ensure the content type is correct
    if request.content_type != 'application/json':
        return jsonify({"error": "Content-Type must be application/json"}), 415

    user_query = request.json.get('query')
    
    if not user_query:
        return jsonify({"error": "Input parameter is required."}), 400

    generative_model = initialize_generative_model()
    response = generate_script(user_query, generative_model)
    
    return jsonify({"test_cases": response.splitlines()})  # Return JSON response

if __name__ == '__main__':
    app.run(debug=True)
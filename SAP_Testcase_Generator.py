from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

embeddings = OpenAIEmbeddings()
vectordb_file_path = "./FAISS_VECTORS"

# Chat prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Please provide the answer to the user's questions based on following content: \n {found_docs}"),
        ("human", "{query}"),
    ]
)

def open_ai_handler(query, found_docs):
    llm = ChatOpenAI(model="gpt-4o-mini")
    parser = StrOutputParser()
    chain = prompt | llm | parser
    output = chain.invoke({"found_docs": found_docs, "query": query})
    return output

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(file.read())
            tmp_location = tmp_file.name
        
        loader = PyPDFLoader(tmp_location)
        pages = loader.load_and_split()
        vectordb = FAISS.from_documents(documents=pages, embedding=embeddings)
        vectordb.save_local(folder_path=vectordb_file_path)
        return jsonify({"message": "Document processed successfully!"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        if tmp_location and os.path.exists(tmp_location):
            os.remove(tmp_location)

@app.route('/query', methods=['POST'])
def query_vector_db():
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        vector_store = FAISS.load_local(vectordb_file_path, embeddings=embeddings, allow_dangerous_deserialization=True)
        found_docs = vector_store.similarity_search(query, k=3)
        response = open_ai_handler(query, found_docs)
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
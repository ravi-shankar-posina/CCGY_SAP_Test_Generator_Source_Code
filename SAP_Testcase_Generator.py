import os
import tempfile
import streamlit as st
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv

load_dotenv()

# Instantiate embeddings with the API key
embeddings = OpenAIEmbeddings()

vectordb_file_path = "./FAISS_VECTORS"

# Chat prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Please provide the answer to the user's questions based on following content: \n {found_docs}",
        ),
        ("human", "{query}"),
    ]
)

def open_ai_handler(query, found_docs):
    llm = ChatOpenAI(model="gpt-4o-mini")
    parser = StrOutputParser()
    chain = prompt | llm | parser

    output = chain.invoke(
        {
            "found_docs": found_docs,
            "query": query,
        }
    )
    return output

def process_uploaded_pdf(file):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(file.getvalue())
            tmp_location = tmp_file.name

        loader = PyPDFLoader(tmp_location)
        pages = loader.load_and_split()
        vectordb = FAISS.from_documents(documents=pages, embedding=embeddings)
        vectordb.save_local(folder_path=vectordb_file_path)
        print("Created and saved new FAISS index to disk.")
        st.write(f"Document processed successfully!")

    except Exception as e:
        st.write(f"Error occurred: {e}")

    finally:
        if tmp_location and os.path.exists(tmp_location):
            os.remove(tmp_location)

st.title("SAP Test Case Generator")

if 'pdf_text' not in st.session_state:
    st.session_state.pdf_text = None

uploaded_file = st.file_uploader("Upload a BRD file")

if uploaded_file is not None:
    if st.session_state.pdf_text is None:
        with st.spinner("Processing the File..."):
            process_uploaded_pdf(uploaded_file)
            st.session_state.pdf_text = "SUCCESS"

if st.session_state.pdf_text is not None:
    st.empty()
    with st.form(key='query_form'):
        query = st.text_input("Enter your query:")
        submit_button = st.form_submit_button(label='Submit Query')

    if submit_button:
        st.session_state.response = ""
        response_placeholder = st.empty()
        with st.spinner("Generating Response..."):
            vector_store = FAISS.load_local(vectordb_file_path, embeddings=embeddings, allow_dangerous_deserialization=True)
            found_docs = vector_store.similarity_search(query, k=3)
            
            response = open_ai_handler(query, found_docs)
            st.session_state.response = "SUCCESS"

            if st.session_state.response:
                formatted_response = f"OpenAI Response:\n\n{response}"
                # Larger response box with word wrap
                response_placeholder.write(formatted_response)
else:
    st.write("Please upload a PDF file.")
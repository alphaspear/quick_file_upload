from flask import Flask, request, redirect, flash, render_template,url_for,jsonify
from werkzeug.utils import secure_filename
import os
import psycopg2
import socket


app = Flask(__name__)


UPLOAD_FOLDER = 'upload/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DB_HOST = "192.168.29.11"
DB_NAME = "quick_file_upload_db"
DB_USER = "quick_file_upload"
DB_PASSWORD = "Abhilash@123"

def connect_db():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/health', methods=['GET'])
def health():
    return f"App running on {socket.gethostname()}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']
        
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
        
    if file:
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].replace('.', '')
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file_size = len(file.read())  
        file.seek(0) 
        file.save(file_path)
        
        # Insert file details into the database
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO public.fl_upld_history (fl_nm, fl_location, fl_size, fl_ext, fl_dnld_host, fl_srce_host)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, (filename, file_path, file_size, file_ext, socket.gethostname(), request.remote_addr))
        conn.commit()
        cur.close()
        conn.close()

        return f'File {filename} uploaded successfully and record saved in the database'

@app.route('/history/ui', methods=['GET'])
def history():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute('SELECT fl_id, fl_nm, fl_location, fl_size, fl_ext, fl_dnld_ts FROM public.fl_upld_history ORDER BY fl_dnld_ts DESC')
    uploads = cur.fetchall()
    cur.close()
    conn.close()
    return render_template('history.html', uploads=uploads)

@app.route('/history', methods=['GET'])
def history_cli():
    # Connect to your database
    conn = connect_db()
    cursor = conn.cursor()
    
    # Query to get upload history
    cursor.execute('SELECT fl_id, fl_nm, fl_location, fl_size, fl_ext, fl_dnld_ts FROM public.fl_upld_history ORDER BY fl_dnld_ts DESC')  # Adjust SQL as per your schema
    uploads = cursor.fetchall()
    
    # Close the database connection
    conn.close()
    
    # Convert the result to JSON format
    uploads_list = [
        {
            "id": upload[0],
            "filename": upload[1],
            "location": upload[2],
            "size": upload[3],
            "extension": upload[4],
            "upload_time": upload[5]
        }
        for upload in uploads
    ]
    
    return jsonify(uploads_list)

if __name__ == '__main__':
    # Create the uploads folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        print("creating dir")
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=8083, debug=True)

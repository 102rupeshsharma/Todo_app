import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import bcrypt
from dotenv import load_dotenv
import os
from datetime import datetime, date, time, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

db_config = {
    'host': os.getenv('HOST'),
    'user': os.getenv('USER'),
    'password': os.getenv('PASSWORD'),
    'database': os.getenv('DATABASE')
}

def connect_db():
    return pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)

def serialize_task(task):
    for key in task:
        if isinstance(task[key], (datetime, date, time)):
            task[key] = task[key].isoformat()
        elif isinstance(task[key], timedelta):
            task[key] = str(task[key])
    return task

@app.route('/')
def index():
    return "Backend is running!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No input data received"}), 400

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    connection = connect_db()
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "Email already registered"}), 409

        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                       (username, email, hashed_password.decode('utf-8')))
        connection.commit()

    connection.close()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        connection = connect_db()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                user_id = user['id']
                username = user['username']
                return jsonify({"message": "Login successful", "user": {"id": user_id, "username": username}}), 200
            else:
                return jsonify({"message": "Invalid email or password"}), 401

    except pymysql.MySQLError as e:
        return jsonify({"message": "Database error", "error": str(e)}), 500
    finally:
        connection.close()

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    user_id = data.get('user_id')
    title = data.get('title')
    description = data.get('description')
    frequency = data.get('frequency')
    due_date = data.get('due_date')
    due_time = data.get('due_time')

    if not all([user_id, title, frequency, due_date, due_time]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        connection = connect_db()
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    frequency VARCHAR(100),
                    due_date DATE,
                    due_time TIME,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            cursor.execute("""INSERT INTO tasks (user_id, title, description, frequency, due_date, due_time)
                              VALUES (%s, %s, %s, %s, %s, %s)""",
                           (user_id, title, description, frequency, due_date, due_time))
            connection.commit()

        return jsonify({'message': 'Task created successfully'}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'message': 'Failed to create task', 'error': str(e)}), 500
    finally:
        connection.close()

@app.route('/tasks/<int:user_id>', methods=['GET'])
def get_tasks(user_id):
    try:
        connection = connect_db()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM tasks WHERE user_id = %s", (user_id,))
            tasks = cursor.fetchall()
            tasks = [serialize_task(task) for task in tasks]
            return jsonify({'tasks': tasks}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'message': 'Error fetching tasks', 'error': str(e)}), 500
    finally:
        connection.close()

@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        connection = connect_db()
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            task = cursor.fetchone()
            if not task:
                return jsonify({'message': 'Task not found'}), 404

            cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            connection.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'message': 'Error deleting task', 'error': str(e)}), 500
    finally:
        connection.close()

@app.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    frequency = data.get('frequency')
    due_date = data.get('due_date')
    due_time = data.get('due_time')

    if not all([title, description, frequency, due_date, due_time]):
        return jsonify({"message": "Missing fields"}), 400

    try:
        conn = connect_db()
        cursor = conn.cursor()

        query = """
            UPDATE tasks
            SET title = %s,
                description = %s,
                frequency = %s,
                due_date = %s,
                due_time = %s
            WHERE id = %s
        """
        cursor.execute(query, (title, description, frequency, due_date, due_time, task_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Task not found"}), 404

        return jsonify({"message": "Task updated successfully"}), 200

    except Exception as e:
        print("Update Error:", e)
        return jsonify({"message": "Server error"}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

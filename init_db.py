import mysql.connector
from mysql.connector import Error
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Ishant2421@'
        )
        
        if conn.is_connected():
            cursor = conn.cursor()
            
            cursor.execute("CREATE DATABASE IF NOT EXISTS waste_classification")
            cursor.execute("USE waste_classification")

            cursor.execute("DROP TABLE IF EXISTS classifications")

            cursor.execute("""
                CREATE TABLE classifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    predicted_class VARCHAR(50) NOT NULL,
                    confidence FLOAT NOT NULL,
                    upload_date DATETIME NOT NULL
                )
            """)
            
            conn.commit()
            logger.info("Database and tables initialized successfully")
            
    except Error as e:
        logger.error(f"Error initializing database: {e}")
        raise e
        
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    init_database()
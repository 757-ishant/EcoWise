import mysql.connector
from mysql.connector import Error
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        return mysql.connector.connect(
            host='localhost',
            user='root',
            password='Ishant2421@',
            database='waste_classification'
        )
    except Error as e:
        logger.error(f"Database connection failed: {e}")
        raise e

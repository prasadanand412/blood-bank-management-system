import os
import sys
import json
from sqlalchemy import create_engine, inspect, text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.config.settings import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
inspector = inspect(engine)

tables = inspector.get_table_names()

output = "# Database Tables Dump\n\n"

with engine.connect() as conn:
    for table in tables:
        output += f"## Table: `{table}`\n\n"
        columns = [col['name'] for col in inspector.get_columns(table)]
        
        output += "|" + "|".join(columns) + "|\n"
        output += "|" + "|".join(["---"] * len(columns)) + "|\n"
        
        try:
            result = conn.execute(text(f"SELECT * FROM {table} LIMIT 50"))
            rows = result.fetchall()
            for row in rows:
                row_strs = [str(x).replace('\n', ' ') for x in row]
                output += "|" + "|".join(row_strs) + "|\n"
            if not rows:
                output += f"| No data in this table |" + "|".join([""] * (len(columns)-1)) + "|\n"
        except Exception as e:
            output += f"Error reading table: {e}\n"
            
        output += "\n---\n\n"

with open("db_dump.md", "w") as f:
    f.write(output)

print("Dump generated successfully.")

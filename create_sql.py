from datetime import datetime

def convert_to_postgresql_datetime(date_str):
    try:
        # Example input: 'Sat Jun 22 2024 01:53:37 GMT+0700 (Indochina Time)'
        dt = datetime.strptime(date_str, '%a %b %d %Y %H:%M:%S GMT%z (%Z)')
    except ValueError:
        # Handle other possible formats here if needed
        dt = datetime.strptime(date_str, '%a %b %d %Y %H:%M:%S %Z')
    return dt.strftime('%Y-%m-%d %H:%M:%S')

input_file = 'test.cvs'
output_file = 'formatted_sql.sql'

with open(input_file, 'r', encoding='utf-8') as input_sql_file, open(output_file, 'w', encoding='utf-8') as output_sql_file:
    for line in input_sql_file:
        if line.startswith("INSERT INTO"):
            # Extract created_at and last_updated values from the line
            parts = line.split(",")
            created_at = parts[7].strip().strip("')")  # Assuming created_at is the 8th value in the VALUES list
            last_updated = parts[8].strip().strip("')")  # Assuming last_updated is the 9th value in the VALUES list
            
            # Convert date strings
            postgres_created_at = convert_to_postgresql_datetime(created_at)
            postgres_last_updated = convert_to_postgresql_datetime(last_updated)
            
            # Replace old datetime strings with formatted ones
            new_line = line.replace(created_at, postgres_created_at).replace(last_updated, postgres_last_updated)
            output_sql_file.write(new_line)
        else:
            output_sql_file.write(line)

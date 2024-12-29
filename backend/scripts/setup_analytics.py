import os
from dotenv import load_dotenv
from supabase import create_client, Client

def setup_analytics():
    """Setup analytics tables in Supabase"""
    load_dotenv()
    
    # Initialize Supabase client
    supabase: Client = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_KEY')
    )
    
    # Read migration SQL
    with open('../migrations/20241229_01_analytics.sql', 'r') as f:
        sql = f.read()
    
    # Execute migration
    print("Creating analytics tables...")
    try:
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print("Analytics tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        return
    
    print("\nAnalytics system is ready for testing!")

if __name__ == "__main__":
    setup_analytics()

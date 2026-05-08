from neo4j import GraphDatabase
import os

uri_ssc = "neo4j+ssc://944adc2b.databases.neo4j.io"
uri_s = "neo4j+s://944adc2b.databases.neo4j.io"
passw = "5NDDvrh3QD-1_Mr07fKXmx0vsjkTW_FNKZ9arMZjIXs"
users = ["944adc2b", "neo4j"]
uris = [uri_ssc, uri_s]

for uri in uris:
    for user in users:
        print(f"Trying: {uri} | User: {user}")
        try:
            driver = GraphDatabase.driver(uri, auth=(user, passw))
            driver.verify_connectivity()
            print(f"--- SUCCESS! URI: {uri}, User: {user} ---")
            driver.close()
            exit(0)
        except Exception as e:
            print(f"Failed: {str(e)[:100]}")

print("All combinations failed.")

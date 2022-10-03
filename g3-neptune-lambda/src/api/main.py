from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
import os

app = FastAPI(title="Neptune test", description="Testing Neptune")


app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello-world")
def get_hello_world():
    return {"msg": "Hello World!"}


@app.get("/test-connection")
def get_test_conenction():
    driver = get_driver()
    return {"msg": "Driver got"}


@app.get("/test-query")
def get_test_conenction():
    driver = get_driver()
    


def get_driver() -> GraphDatabase.driver:
    host = os.environ.get("DB_HOSTNAME")
    port = os.environ.get("DB_PORT")
    uri = f"bolt://{host}:{port}"
    # Note that the auth parameters are ignored.
    # https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-opencypher-bolt.html
    return GraphDatabase.driver(
        uri, auth=("username", "password"), encrypted=True
    )

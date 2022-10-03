from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

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

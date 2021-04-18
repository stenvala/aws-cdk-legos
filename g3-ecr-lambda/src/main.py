
from fastapi import FastAPI
from mangum import Mangum
import routes

app = FastAPI(title='demo',
              description='Demo just for fun')

app.include_router(routes.router, prefix='/hello-world')

handler = Mangum(app=app)

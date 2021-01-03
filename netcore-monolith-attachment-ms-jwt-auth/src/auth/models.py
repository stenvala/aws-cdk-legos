from pydantic import BaseModel
from typing import List


class Area(BaseModel):
    id: str
    permissions: List[str] = []


class EncodeBody(BaseModel):
    docId: str
    permissions: List[Area]


class DecodeBody(BaseModel):
    docId: str
    area: str
    permission: str
    jwt: str

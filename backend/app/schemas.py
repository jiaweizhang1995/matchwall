from typing import Literal, Optional
from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    code: str = Field(min_length=1, max_length=128)


class LoginOut(BaseModel):
    token: str
    role: Literal["admin", "visitor"]


Gender = Literal["male", "female"]
Scope = Literal["all_male", "all_female", "custom"]


class GuestIn(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    gender: Gender
    age: Optional[int] = Field(default=None, ge=0, le=150)
    height: Optional[int] = Field(default=None, ge=0, le=300)
    education: Optional[str] = Field(default=None, max_length=32)
    job: Optional[str] = Field(default=None, max_length=64)
    city: Optional[str] = Field(default=None, max_length=64)
    intro: Optional[str] = Field(default=None, max_length=2000)
    photo_url: Optional[str] = Field(default=None, max_length=256)


class GuestOut(GuestIn):
    id: str
    created_at: int


class TokenIn(BaseModel):
    value: str = Field(min_length=1, max_length=64)
    scope: Scope
    guest_ids: list[str] = Field(default_factory=list)


class TokenOut(BaseModel):
    id: str
    value: str
    scope: Scope
    guest_ids: list[str]
    created_at: int


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=4, max_length=128)
    confirm_password: str = Field(min_length=4, max_length=128)


class UploadOut(BaseModel):
    url: str

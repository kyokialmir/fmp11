import jwt
from config import SECRET_KEY

def decode_jwt_token(token):
    try:
        print(f"🔍 Received Token: {token}")  # ✅ Debugging
        
        token = token.replace("Bearer ", "")  # ✅ Ensure token format
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        print(f"✅ Decoded User: {decoded}")  # ✅ Debugging
        return decoded

    except jwt.ExpiredSignatureError:
        print("❌ Token Expired")
        return None

    except jwt.InvalidTokenError:
        print("❌ Invalid Token")
        return None

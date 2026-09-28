import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.services.security import verify_password

h_staff = "$pbkdf2-sha256$29000$L8VYy1krxZiTkrK2dg7hHA$ePkXkaUcFejxqnaO0qFpqxdM/DVgKzCUAIc8QlPdAFo"
h_cust = "$pbkdf2-sha256$29000$VmrtfQ8BYOwdQ6iVMqZU6g$UFNFeOb3o3OFoQh3Us.0lbKKDr554MXysyYGiFbPGJk"

print("Staff password is admin123:", verify_password("admin123", h_staff))
print("Customer password is admin123:", verify_password("admin123", h_cust))

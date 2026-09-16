import os
import sys
import base64

source_root = r"C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project"
target_dir = r"C:\dev\my-portfolio\temp_dashboards"
os.makedirs(target_dir, exist_ok=True)

# 1. Screening App Dashboard
print("Exporting Screening_App authenticated dashboard...")
screening_dir = os.path.join(source_root, "Screening_App")
sys.path.insert(0, screening_dir)
try:
    from app import app as screening_app
    client = screening_app.test_client()
    auth_header = "Basic " + base64.b64encode(b"chair:masterpassword").decode("ascii")
    res = client.get("/dashboard", headers={"Authorization": auth_header})
    if res.status_code == 200:
        dashboard_html = res.data.decode("utf-8", errors="ignore")
        # Ensure relative links don't break
        out_path = os.path.join(target_dir, "screening_dashboard.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(dashboard_html)
        print(f"[OK] Saved: {out_path} ({len(dashboard_html)} chars)")
    else:
        print(f"[FAIL] Screening_App /dashboard returned {res.status_code}")
except Exception as e:
    print(f"[FAIL] Error exporting Screening_App: {e}")

# 2. Enrollment App Advising Ledger
print("\nExporting Enrollment_App advising ledger...")
enroll_dir = os.path.join(source_root, "Enrollment_App")
sys.path.insert(0, enroll_dir)
try:
    from Advising_App import app as enroll_app
    client = enroll_app.test_client()
    res = client.get("/")
    if res.status_code == 200:
        enroll_html = res.data.decode("utf-8", errors="ignore")
        out_path = os.path.join(target_dir, "enrollment_dashboard.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(enroll_html)
        print(f"[OK] Saved: {out_path} ({len(enroll_html)} chars)")
    else:
        print(f"[FAIL] Enrollment_App returned {res.status_code}")
except Exception as e:
    print(f"[FAIL] Error exporting Enrollment_App: {e}")

print("\nPython dashboard exports complete!")

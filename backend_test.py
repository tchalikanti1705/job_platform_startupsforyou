import requests
import sys
import json
from datetime import datetime, timezone
import time

class JobHubAPITester:
    def __init__(self, base_url="https://jobhub-local.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_signup(self):
        """Test user signup"""
        timestamp = int(time.time())
        test_user = {
            "email": f"test.user.{timestamp}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test("User Signup", "POST", "auth/signup", 200, test_user)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['user_id']
            print(f"   Token: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # Use the same credentials from signup
        if not hasattr(self, '_test_email'):
            return False
            
        credentials = {
            "email": self._test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, credentials)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_jobs_search(self):
        """Test job search endpoint"""
        return self.run_test("Job Search", "GET", "jobs/search", 200)

    def test_jobs_search_with_filters(self):
        """Test job search with filters"""
        return self.run_test("Job Search with Filters", "GET", "jobs/search?query=developer&skills=python&remote=true", 200)

    def test_recommended_jobs(self):
        """Test recommended jobs endpoint"""
        return self.run_test("Recommended Jobs", "GET", "jobs/recommended", 200)

    def test_startup_list(self):
        """Test startup list endpoint"""
        return self.run_test("Startup List", "GET", "jobs/startups/list", 200)

    def test_get_job_detail(self):
        """Test getting a specific job"""
        # First get jobs to find a valid job_id
        success, jobs_response = self.run_test("Get Jobs for Detail Test", "GET", "jobs/search?limit=1", 200)
        
        if success and jobs_response and len(jobs_response) > 0:
            job_id = jobs_response[0]['job_id']
            return self.run_test("Get Job Detail", "GET", f"jobs/{job_id}", 200)
        else:
            self.log_test("Get Job Detail", False, "No jobs available to test")
            return False

    def test_create_application(self):
        """Test creating a job application"""
        # First get a job to apply to
        success, jobs_response = self.run_test("Get Jobs for Application Test", "GET", "jobs/search?limit=1", 200)
        
        if success and jobs_response and len(jobs_response) > 0:
            job_id = jobs_response[0]['job_id']
            application_data = {
                "job_id": job_id,
                "notes": "Test application from automated testing"
            }
            
            success, response = self.run_test("Create Application", "POST", "applications", 200, application_data)
            
            if success and 'application_id' in response:
                self.application_id = response['application_id']
                return True
            return False
        else:
            self.log_test("Create Application", False, "No jobs available to apply to")
            return False

    def test_get_applications(self):
        """Test getting user applications"""
        return self.run_test("Get Applications", "GET", "applications", 200)

    def test_update_application_status(self):
        """Test updating application status"""
        if not hasattr(self, 'application_id'):
            self.log_test("Update Application Status", False, "No application to update")
            return False
            
        update_data = {
            "status": "Interview",
            "notes": "Updated status from test"
        }
        
        return self.run_test("Update Application Status", "PATCH", f"applications/{self.application_id}/status", 200, update_data)

    def test_insights_endpoint(self):
        """Test insights endpoint"""
        return self.run_test("Insights Summary", "GET", "insights/summary", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting JobHub API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Basic health check
        self.test_health_check()

        # Auth flow
        if self.test_signup():
            self.test_get_me()
            
            # Job-related tests
            self.test_jobs_search()
            self.test_jobs_search_with_filters()
            self.test_recommended_jobs()
            self.test_startup_list()
            self.test_get_job_detail()
            
            # Application flow
            if self.test_create_application():
                self.test_get_applications()
                self.test_update_application_status()
            
            # Insights
            self.test_insights_endpoint()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = JobHubAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
#!/bin/bash

# Gemini API Integration - Test Suite
# Run these commands from your terminal to test all endpoints
# Make sure the backend server is running on http://localhost:5000

echo "=========================================="
echo "Gemini API Integration Test Suite"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -X GET http://localhost:5000/api/test/gemini/health
echo ""
echo ""

# Test 2: Simple Prompt
echo "2️⃣  Testing Simple Prompt..."
curl -X POST http://localhost:5000/api/test/gemini/simple \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the top 5 skills for a senior software engineer?"
  }'
echo ""
echo ""

# Test 3: Resume Analysis
echo "3️⃣  Testing Resume Analysis..."
curl -X POST http://localhost:5000/api/test/gemini/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeContent": "John Doe\nSoftware Engineer\n\nExperience:\n- 5 years at Google as Senior Engineer working on backend systems\n- 2 years at Microsoft as Software Engineer working on cloud services\n\nSkills: Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes\n\nEducation: BS Computer Science from MIT\n\nCertifications: AWS Certified Solutions Architect"
  }'
echo ""
echo ""

# Test 4: Job Analysis
echo "4️⃣  Testing Job Analysis..."
curl -X POST http://localhost:5000/api/test/gemini/analyze-job \
  -H "Content-Type: application/json" \
  -d '{
    "jobContent": "Senior Software Engineer - Backend\n\nWe are looking for an experienced backend engineer to lead our platform team.\n\nRequirements:\n- 5+ years of backend development experience\n- Strong Python and JavaScript skills\n- AWS and Docker experience\n- Experience with microservices\n\nResponsibilities:\n- Design and implement scalable backend systems\n- Lead a team of engineers\n- Mentor junior developers\n- Participate in architecture decisions\n\nEducation:\n- BS Computer Science or equivalent\n\nNice to have:\n- Kubernetes experience\n- Distributed systems knowledge"
  }'
echo ""
echo ""

# Test 5: Resume to Job Comparison
echo "5️⃣  Testing Resume to Job Comparison..."
curl -X POST http://localhost:5000/api/test/gemini/compare \
  -H "Content-Type: application/json" \
  -d '{
    "resumeContent": "John Doe\nSoftware Engineer\n\nExperience:\n- 5 years at Google as Senior Engineer working on backend systems\n- 2 years at Microsoft as Software Engineer working on cloud services\n\nSkills: Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes\n\nEducation: BS Computer Science from MIT\n\nCertifications: AWS Certified Solutions Architect",
    "jobContent": "Senior Software Engineer - Backend\n\nWe are looking for an experienced backend engineer to lead our platform team.\n\nRequirements:\n- 5+ years of backend development experience\n- Strong Python and JavaScript skills\n- AWS and Docker experience\n- Experience with microservices\n\nResponsibilities:\n- Design and implement scalable backend systems\n- Lead a team of engineers\n- Mentor junior developers\n\nEducation:\n- BS Computer Science or equivalent"
  }'
echo ""
echo ""

# Test 6: Improvement Suggestions
echo "6️⃣  Testing Improvement Suggestions..."
curl -X POST http://localhost:5000/api/test/gemini/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "resumeContent": "John Doe\nSoftware Engineer\n\nExperience:\n- 5 years at Google as Senior Engineer\n- 2 years at Microsoft as Engineer\n\nSkills: Python, JavaScript, React, Node.js",
    "jobContent": "Senior Software Engineer - Python\n\nRequirements:\n- 5+ years Python experience\n- AWS knowledge\n- Team leadership experience"
  }'
echo ""
echo ""

echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="

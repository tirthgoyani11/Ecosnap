# Amazon SP-API Credentials Setup Guide

## 🎯 What You Have vs What You Need

### ✅ What You Already Have:
- **Application ID**: `amzn1.sp.solution.66c30c96-2471-4310-91d1-39a2594d5756`
- **Sandbox Refresh Token**: `Atzr|IwEBIEN4IPHDnaYdC4Unp1yO4C70CTt2t8u7RQeHn8W6qjYKEnrZYdn_L_3Dvny_0r0hupKVyxoNxyaWkFBk0UubE4fy7I2rt2WwuVVDMKAQYeCZ6QEzktWTph3S45paFmLOmN5Ynt`

### ❓ What You Still Need:
- **Client ID** (OAuth identifier)
- **Client Secret** (OAuth secret)
- **AWS Access Key ID** (IAM user credentials)
- **AWS Secret Access Key** (IAM user credentials)
- **Role ARN** (IAM role for SP-API)

## 🔍 Step-by-Step Guide to Find Missing Credentials

### Step 1: Get Client ID & Client Secret

1. **Go to Amazon Developer Console**
   - Visit: https://developer.amazon.com/
   - Sign in with your Amazon developer account

2. **Navigate to Login with Amazon**
   - Go to "Developer Console" → "Login with Amazon"
   - Look for your application or create a new Security Profile

3. **Find OAuth Credentials**
   - Click on your Security Profile
   - Look for "Web Settings" or "Client ID and Client Secret"
   - Copy the **Client ID** and **Client Secret**

### Step 2: Get AWS Access Keys

#### Method A: AWS IAM Console
1. **Go to AWS Console**
   - Visit: https://console.aws.amazon.com/iam/
   - Sign in with your AWS account

2. **Create SP-API User**
   - Go to "Users" → "Add user"
   - Username: `sp-api-user` (or similar)
   - Access type: "Programmatic access"

3. **Attach Policies**
   - Attach policy: `AmazonSellingPartnerAPIRole`
   - Or create custom policy with SP-API permissions

4. **Get Keys**
   - Download the **Access Key ID** and **Secret Access Key**
   - ⚠️ **Important**: Save these immediately, you won't see the secret again!

#### Method B: From Your SP-API Application
1. **Amazon Seller Central**
   - Go to: https://sellercentral.amazon.com/
   - Navigate to "Apps & Services" → "Develop apps"

2. **Find Your Application**
   - Look for your application with ID: `amzn1.sp.solution.66c30c96-2471-4310-91d1-39a2594d5756`
   - Check for AWS credentials section

### Step 3: Get Role ARN

1. **AWS IAM Console**
   - Go to "Roles" section
   - Look for a role like `SellingPartnerAPIRole` or similar

2. **Copy Role ARN**
   - Click on the role
   - Copy the ARN (looks like: `arn:aws:iam::123456789012:role/SellingPartnerAPIRole`)

### Step 4: Find All Credentials in One Place

**If you have access to your original SP-API setup:**

1. **Developer Console**
   - https://developer.amazon.com/dashboard
   - Look for your SP-API application

2. **Check Application Details**
   - All credentials should be listed in the application configuration
   - Look for sections like:
     - "OAuth Credentials" (Client ID/Secret)
     - "AWS Credentials" (Access Keys)
     - "IAM Role" (Role ARN)

## 🛠️ Alternative: Use Amazon's SP-API Test Credentials

If you're still in development, you can use Amazon's test credentials:

```env
# Development/Testing Credentials (Amazon provides these for testing)
VITE_AMAZON_CLIENT_ID=amzn1.application-oa2-client.your-client-id
VITE_AMAZON_CLIENT_SECRET=your-client-secret-from-lwa
VITE_AMAZON_ACCESS_KEY_ID=AKIA...your-aws-access-key
VITE_AMAZON_SECRET_ACCESS_KEY=your-aws-secret-key
VITE_AMAZON_ROLE_ARN=arn:aws:iam::123456789012:role/YourSPAPIRole
```

## 🔧 What Each Credential Does

| Credential | Purpose | Where to Find |
|------------|---------|---------------|
| **Application ID** | ✅ Your SP-API app identifier | Developer Console |
| **Refresh Token** | ✅ Authentication token | Sandbox Testing page |
| **Client ID** | OAuth client identifier | Login with Amazon |
| **Client Secret** | OAuth client secret | Login with Amazon |
| **Access Key ID** | AWS IAM user key | AWS IAM Console |
| **Secret Access Key** | AWS IAM user secret | AWS IAM Console |
| **Role ARN** | AWS role for SP-API | AWS IAM Console |

## 🚨 Common Issues & Solutions

### Issue 1: "Can't find Client ID/Secret"
**Solution**: Create a new Security Profile in Login with Amazon console

### Issue 2: "No AWS Access Keys"
**Solution**: Create a new IAM user specifically for SP-API

### Issue 3: "Don't know my Role ARN"
**Solution**: Check AWS IAM → Roles, or create a new role with SP-API permissions

### Issue 4: "Everything is in Sandbox"
**Solution**: You can use sandbox credentials for development, then get production credentials later

## 📞 Need Help?

If you're still stuck, you can:

1. **Contact Amazon Developer Support**
   - https://developer.amazon.com/support/

2. **Check Amazon SP-API Documentation**
   - https://developer-docs.amazon.com/sp-api/

3. **Use Mock Data for Now**
   - The EcoSnap system has comprehensive fallbacks
   - You can develop without real Amazon data initially

## ✅ Once You Have All Credentials

Update your `.env` file:

```env
VITE_AMAZON_APPLICATION_ID=amzn1.sp.solution.66c30c96-2471-4310-91d1-39a2594d5756
VITE_AMAZON_REFRESH_TOKEN=Atzr|IwEBIEN4IPHDnaYdC4Unp1yO4C70CTt2t8u7RQeHn8W6qjYKEnrZYdn_L_3Dvny_0r0hupKVyxoNxyaWkFBk0UubE4fy7I2rt2WwuVVDMKAQYeCZ6QEzktWTph3S45paFmLOmN5Ynt
VITE_AMAZON_CLIENT_ID=your_client_id_here
VITE_AMAZON_CLIENT_SECRET=your_client_secret_here
VITE_AMAZON_ACCESS_KEY_ID=your_access_key_id_here
VITE_AMAZON_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_AMAZON_ROLE_ARN=your_role_arn_here
```

Then test your integration with:
```typescript
import { testAmazonAPI } from './src/test-amazon-integration';
await testAmazonAPI();
```
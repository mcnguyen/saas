# Healthcare SaaS Project

## Example containerized project deployed to AWS Lambda Container Image

This repo is covered on my AI Engineering Production course track (week 1) here:

https://edwarddonner.com/curriculum

## Link to the full instructions

This is a short version of the Week 1 Day 5 instructions!  The full version is here:

https://github.com/ed-donner/production/tree/main/week1

## Concise instructions

### Prerequisites

Prior steps covered on the course: 
1. You've created or cloned this repo
2. You've set an an AWS account, created an IAM user, and assigned all relevant permissions, and set up budget alerts
3. You've installed the AWS CLI and you've run `aws configure`
4. You have docker desktop installed and running, so `docker ps` works
5. You've created a `.env` and `.env.local` file from the examples given and filled in your keys

### The steps

#### STEP 1: Create ECR Repository

1. In AWS Console, search for **ECR**
2. Click **Get started** or **Create repository**
3. **Important**: Make sure you're in the correct region (top right of AWS Console — should match your `DEFAULT_AWS_REGION`)
4. Settings:
   - Visibility settings: **Private** (or the heading might be 'Create private repository')
   - Repository name: `consultation-app` (must match exactly!)
   - Leave all other settings as default
5. Click **Create repository**
6. **Verify**: You should see your new `consultation-app` repository in the list

#### STEP 2: Push Image to ECR

**Mac/Linux**:
```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# 1. Authenticate Docker to ECR (using your .env values!)
aws ecr get-login-password --region $DEFAULT_AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$DEFAULT_AWS_REGION.amazonaws.com

# 2. Build for Linux/AMD64 (CRITICAL for Apple Silicon Macs!)
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -t consultation-app .

# 3. Tag your image
docker tag consultation-app:latest $AWS_ACCOUNT_ID.dkr.ecr.$DEFAULT_AWS_REGION.amazonaws.com/consultation-app:latest

# 4. Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$DEFAULT_AWS_REGION.amazonaws.com/consultation-app:latest
```

**Windows PowerShell**:
```powershell
# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^(.+?)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

# 1. Authenticate Docker to ECR
aws ecr get-login-password --region $env:DEFAULT_AWS_REGION | docker login --username AWS --password-stdin "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:DEFAULT_AWS_REGION.amazonaws.com"

# 2. Build for Linux/AMD64
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -t consultation-app .

# 3. Tag your image
docker tag consultation-app:latest "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:DEFAULT_AWS_REGION.amazonaws.com/consultation-app:latest"

# 4. Push to ECR
docker push "$env:AWS_ACCOUNT_ID.dkr.ecr.$env:DEFAULT_AWS_REGION.amazonaws.com/consultation-app:latest"
```

**Note for Apple Silicon (M1/M2/M3/M4/M5) Macs**: The `--platform linux/amd64` flag is ESSENTIAL. Without it, Lambda will fail with an "exec format error" because Lambda runs amd64 by default.

#### STEP 3: Set up Lambda

1. In the AWS console, search for Lambda, confirm the region (top right) is your default, click **Create Function**
2. Select **Container image** and **Function name**: `consultation-app`
3. **Container image URI**: click **Browse images** Select repository: `consultation-app` and tag `latest` and click **Create function**
4. Now on the function's page click `Configuration`
   - Select General Configuration, Edit. Change Memory to 1024 MB and timeout to 5 minutes, and Save
   - Select Environment Variables and add `CLERK_SECRET_KEY`, `CLERK_JWKS_URL` and `OPENAI_API_KEY` then Save
   - Select Function URL. Select **Auth type**: **NONE**. Under Additional Settings, **Invoke mode**: **RESPONSE_STREAM**. Then click Save.

And then click the function URL at the top of the page - and VICTORY - you should be looking at a healthcare SaaS app, live on the internet!
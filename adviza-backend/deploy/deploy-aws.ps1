# Adviza AI - AWS Deployment Automation Script
param (
    [string]$Region = "ap-south-1",
    [string]$Profile = "pratyush.26",
    [string]$AccountId = "051580166973",
    [string]$RepoName = "adviza-backend",
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Adviza Backend AWS Deployment" -ForegroundColor Cyan
Write-Host "Profile: $Profile | Region: $Region | Account: $AccountId" -ForegroundColor Gray

$AwsExe = "C:\Users\sony\AppData\Local\Programs\Amazon\AWSCLIV2\aws.exe"
if (-not (Test-Path $AwsExe)) {
    $AwsExe = "aws"
}

# 1. Authenticate Docker with Amazon ECR
Write-Host "`n🔑 Authenticating with Amazon ECR..." -ForegroundColor Yellow
& $AwsExe ecr get-login-password --region $Region --profile $Profile | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

# 2. Ensure ECR Repository exists
Write-Host "`n📦 Checking ECR Repository '$RepoName'..." -ForegroundColor Yellow
$repoCheck = & $AwsExe ecr describe-repositories --repository-names $RepoName --region $Region --profile $Profile 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating ECR repository $RepoName..." -ForegroundColor Green
    & $AwsExe ecr create-repository --repository-name $RepoName --region $Region --profile $Profile `
        --image-scanning-configuration scanOnPush=true
}

# 3. Build Docker Image
$ImageUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/${RepoName}:${Tag}"
Write-Host "`n🔨 Building Docker image: $ImageUri..." -ForegroundColor Yellow
docker build -t $ImageUri -f ./Dockerfile .

# 4. Push to ECR
Write-Host "`n⬆️ Pushing image to ECR..." -ForegroundColor Yellow
docker push $ImageUri

# 5. Deploy CloudFormation Stack
Write-Host "`n☁️ Deploying AWS CloudFormation Stack 'adviza-backend-stack'..." -ForegroundColor Yellow
& $AwsExe cloudformation deploy `
    --template-file ./deploy/aws-infrastructure.yml `
    --stack-name adviza-backend-stack `
    --parameter-overrides ImageUri=$ImageUri Environment=production `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region `
    --profile $Profile

Write-Host "`n✅ AWS Deployment complete!" -ForegroundColor Green

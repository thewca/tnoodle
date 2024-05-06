# IAC for TNoodle

## Requirements

-   Terraform
-   AWS Account with credentials configured

## Get started

```bash
cd iac
terraform init
terraform apply -target='module.tnoodle_frontend.aws_s3_bucket.fontend_bucket'
terraform apply
```

If you agree with the plan in the output, type `yes`.

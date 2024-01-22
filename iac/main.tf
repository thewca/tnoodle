terraform {
  backend "s3" {
    bucket = "NON-EXISTING-BUCKET"
    key    = "tnoodle-web-scramble"
    region = "us-west-2"
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

//import terraformSchema from './json/terraform_schema.json';
/*
import { readFile } from 'fs/promises';
const terraformSchema = JSON.parse(
    await readFile(
        new URL('./json/terraform_schema.json', import.meta.url)
    )
);
*/

//function convertJson() {
// This example is created to test hcl-to-json on runkit.com
hcltojson = require('hcl-to-json');

var hcl_content;

hcl_content = `
# Create a new instance of the latest Ubuntu 14.04 on an
# t1.micro node with an AWS Tag naming it "HelloWorld"
provider "aws" {
    region = "us-east-1"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name = "name"
    values = ["ubuntu/images/ebs/ubuntu-trusty-14.04-amd64-server-*"]
  }
  filter {
    name = "virtualization-type"
    values = ["paravirtual"]
  }
  filter {
    name = "next-virtualization-type"
    values = ["paravirtual", "storage"]
  }
  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "web" {
    instance_type = "t1.micro"
    tags {
        Name = "HelloWorld"
    }
}

variable "key_pair" {
  default = "aws-key"
}
`

json = hcltojson(hcl_content);
console.log(JSON.stringify(json, null, 2));

    //return json;
//}
//export default parseJson;
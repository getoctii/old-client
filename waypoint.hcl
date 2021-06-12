project = "octii-client"

app "octii-client" {
  labels = {
    "service" = "octii-client"
  }

  build {
    use "pack" {}
  }

  deploy {
    use "docker" {}
  }
}
# Deployment

Three deployment methods are available. **Kustomize** is the recommended path for OpenShift.

---

## Kustomize (recommended)

Kustomize overlays in `kustomize/overlays/` manage the two environments. Each overlay renders the Helm chart and injects secrets from a local gitignored file — no secrets are ever committed.

| Environment | Namespace | Replicas | OTel |
|-------------|-----------|:--------:|:----:|
| dev | `simpleshop-dev` | 1 | enabled |
| prod | `simpleshop-prod` | 2 | enabled |

### Prerequisites

Kustomize v5+ with Helm support — verify with `kustomize version`.

### Deploy

**1. Create the secrets files** (once per environment, never committed):

```bash
cat > kustomize/overlays/dev/secrets.env <<EOF
SESSION_SECRET=your-dev-session-secret
PGPASSWORD=your-dev-db-password
EOF

cat > kustomize/overlays/prod/secrets.env <<EOF
SESSION_SECRET=your-prod-session-secret
PGPASSWORD=your-prod-db-password
EOF
```

**2. Create the projects and pull secrets** (once per cluster):

```bash
oc new-project simpleshop-dev
oc new-project simpleshop-prod

for NS in simpleshop-dev simpleshop-prod; do
  kubectl create secret docker-registry quay-pull-secret \
    --docker-server=quay.io \
    --docker-username=<your-username> \
    --docker-password='<your-token>' \
    -n $NS

  kubectl create secret docker-registry rh-registry-secret \
    --docker-server=registry.redhat.io \
    --docker-username=<your-rh-username> \
    --docker-password='<your-rh-token>' \
    -n $NS
done
```

**3. Build and apply:**

```bash
kustomize build --enable-helm kustomize/overlays/dev | oc apply -f -
kustomize build --enable-helm kustomize/overlays/prod | oc apply -f -
```

**4. Link pull secrets** (after first deploy, which creates the service account):

```bash
for NS in simpleshop-dev simpleshop-prod; do
  oc secrets link simpleshop quay-pull-secret --for=pull -n $NS
  oc secrets link simpleshop rh-registry-secret --for=pull -n $NS
  oc rollout restart deployment/simpleshop -n $NS
done
```

Preview without applying:

```bash
kustomize build --enable-helm kustomize/overlays/dev
```

---

## Helm

The Helm chart in `helm/` can also be used directly.

### Install

```bash
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=<your-registry> \
  --docker-username=<your-username> \
  --docker-password='<your-token>'

helm install simpleshop ./helm \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

### OpenShift

```bash
oc new-project simpleshop-dev

kubectl create secret docker-registry quay-pull-secret \
  --docker-server=quay.io \
  --docker-username=<your-username> \
  --docker-password='<your-token>'

kubectl create secret docker-registry rh-registry-secret \
  --docker-server=registry.redhat.io \
  --docker-username=<your-rh-username> \
  --docker-password='<your-rh-token>'

helm install simpleshop ./helm \
  -f helm/values-openshift-dev.yaml \
  --namespace simpleshop-dev \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>

# After deploy: link pull secrets to the service account
oc secrets link simpleshop quay-pull-secret --for=pull -n simpleshop-dev
oc secrets link simpleshop rh-registry-secret --for=pull -n simpleshop-dev
oc rollout restart deployment/simpleshop -n simpleshop-dev
```

Access the app:

```bash
oc get route simpleshop -n simpleshop-dev
```

### Upgrade

```bash
helm upgrade simpleshop ./helm \
  --set sessionSecret=<your-session-secret> \
  --set postgresql.password=<your-db-password>
```

### Uninstall

```bash
helm uninstall simpleshop
```

### External PostgreSQL

```bash
helm install simpleshop ./helm \
  --set postgresql.enabled=false \
  --set externalPostgresql.host=<host> \
  --set externalPostgresql.user=<user> \
  --set externalPostgresql.password=<password> \
  --set externalPostgresql.database=<database> \
  --set sessionSecret=<your-session-secret>
```

---

## Raw manifests

The `k8s/` directory contains plain Kubernetes manifests.

```bash
# 1. Set secrets
# Edit k8s/secret.yml with real values

# 2. Build and push image
podman build -t <your-registry>/simpleshop:latest .
podman push <your-registry>/simpleshop:latest

# 3. Update image reference in k8s/deployment.yml

# 4. Create pull secret
kubectl create secret docker-registry quay-pull-secret \
  --docker-server=<your-registry> \
  --docker-username=<your-username> \
  --docker-password='<your-token>'

# 5. Apply
kubectl apply -f k8s/

# 6. Access
kubectl port-forward service/simpleshop 3000:80
```

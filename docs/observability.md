# Observability

SimpleShop uses **OpenTelemetry** for distributed tracing and **Tempo** as the trace backend, deployed via operators on OpenShift. Tracing is enabled by default in both environments.

## How it works

```
simpleshop pod
  └── OTel auto-instrumentation (injected by operator)
        └── OTLP HTTP → simpleshop-collector:4318
              └── OTLP gRPC → tempo-simpleshop:4317 (TempoMonolithic)
                    └── Jaeger-compatible UI
```

The `Instrumentation` CR tells the OpenTelemetry Operator to inject the Node.js agent as an init container — no code changes required.

## Install the operators

Run once cluster-wide (requires cluster-admin):

```bash
# Red Hat build of OpenTelemetry
oc apply -f - <<EOF
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: opentelemetry-product
  namespace: openshift-operators
spec:
  channel: stable
  name: opentelemetry-product
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF

# Tempo Operator
oc apply -f - <<EOF
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: tempo-product
  namespace: openshift-operators
spec:
  channel: stable
  name: tempo-product
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF
```

Wait for both to reach `Succeeded`:

```bash
oc get csv -n openshift-operators -w
```

## Access the Jaeger UI

The Tempo operator creates the service but not the Route. Expose it once per namespace:

```bash
oc expose svc tempo-simpleshop-jaegerui --port=16686 -n simpleshop-dev
oc get route tempo-simpleshop-jaegerui -n simpleshop-dev
```

Open the URL, select **`simpleshop`** as the service, and click **Find Traces**.

## Verify the pipeline

Check the auto-instrumentation was injected:

```bash
oc get pod -l app.kubernetes.io/name=simpleshop -n simpleshop-dev \
  -o jsonpath='{.items[0].spec.initContainers[*].name}'
# Expected: opentelemetry-auto-instrumentation-nodejs
```

If missing, restart the deployment (the Instrumentation CR must exist before the pod is created):

```bash
oc rollout restart deployment/simpleshop -n simpleshop-dev
```

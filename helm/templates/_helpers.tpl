{{- define "simpleshop.name" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "simpleshop.labels" -}}
app.kubernetes.io/name: simpleshop
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "simpleshop.selectorLabels" -}}
app.kubernetes.io/name: simpleshop
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "simpleshop.postgresName" -}}
{{ .Release.Name }}-postgres
{{- end }}

{{- define "simpleshop.postgresSelectorLabels" -}}
app.kubernetes.io/name: postgres
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Resolves PG connection values from embedded or external postgresql */}}
{{- define "simpleshop.pgHost" -}}
{{- if .Values.postgresql.enabled -}}
{{ include "simpleshop.postgresName" . }}
{{- else -}}
{{ .Values.externalPostgresql.host }}
{{- end }}
{{- end }}

{{- define "simpleshop.pgPort" -}}
{{- if .Values.postgresql.enabled -}}
5432
{{- else -}}
{{ .Values.externalPostgresql.port }}
{{- end }}
{{- end }}

{{- define "simpleshop.pgDatabase" -}}
{{- if .Values.postgresql.enabled -}}
{{ .Values.postgresql.database }}
{{- else -}}
{{ .Values.externalPostgresql.database }}
{{- end }}
{{- end }}

{{- define "simpleshop.pgUser" -}}
{{- if .Values.postgresql.enabled -}}
{{ .Values.postgresql.user }}
{{- else -}}
{{ .Values.externalPostgresql.user }}
{{- end }}
{{- end }}

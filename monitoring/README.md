# Forge Monitoring

Prometheus + Grafana + Loki monitoring stack.

## Services

| Service | Port | Description |
|---|---|---|
| Grafana | 3003 | Dashboards UI |
| Prometheus | 9090 | Metrics storage |
| Loki | 3100 | Log aggregation |
| Node Exporter | 9100 | Host metrics |
| cAdvisor | 8080 | Container metrics |

## Start

```bash
cd monitoring
docker compose up -d
```

## Access

- Grafana: http://<server-ip>:3003 (admin / forge-admin)
- Prometheus: http://<server-ip>:9090

## Add another server

In `prometheus/prometheus.yml` add a new job:

```yaml
- job_name: server-02
  static_configs:
    - targets: [<new-server-ip>:9100]
      labels:
        server: server-02
```

Then install node-exporter on the new server and restart Prometheus.

## Change Grafana password

Set `GRAFANA_PASSWORD` in a `.env` file inside the `monitoring/` folder:

```
GRAFANA_PASSWORD=your-secure-password
```

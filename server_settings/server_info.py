import platform
import psutil


def get_server_info():
    uname = platform.uname()
    return {
        "hostname": uname.node,
        "os": uname.system,
        "os_release": uname.release,
        "os_version": uname.version,
        "architecture": uname.machine,
        "processor": uname.processor,
    }


def get_server_status():
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "network": psutil.net_io_counters().bytes_sent,
    }

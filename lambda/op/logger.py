import colorlog

handler = colorlog.StreamHandler()
handler.setFormatter(
    colorlog.ColoredFormatter("%(log_color)s[%(levelname)s] %(message)s")
)

logger = colorlog.getLogger("main")
logger.propagate = False
logger.setLevel("DEBUG")
if not logger.handlers:
    logger.addHandler(handler)

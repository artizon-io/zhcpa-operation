# https://hub.docker.com/r/amazon/aws-lambda-python

FROM public.ecr.aws/lambda/python:3.11

COPY requirements.txt  .
RUN  pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

COPY op/ ${LAMBDA_TASK_ROOT}/op/

COPY lambda.py ${LAMBDA_TASK_ROOT}
COPY .env ${LAMBDA_TASK_ROOT}

CMD [ "lambda.handler" ]
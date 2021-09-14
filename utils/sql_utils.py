from database.database_connection import database_engine as db

import datetime


def append_to_db(obj, auto_commit=False):
    db.session.add(obj)
    if auto_commit:
        commit_db()


def delete_from_db(obj, auto_commit=False):
    db.session.delete(obj)
    if auto_commit:
        commit_db()


def commit_db():
    db.session.commit()


def sql_to_json(sql_obj):
    ret_obj = {}
    imps = get_important_sql_parts(sql_obj)
    for obj in dir(sql_obj):
        if obj in imps:
            ret_obj[obj] = getattr(sql_obj, obj)
    return ret_obj


def sql_list_to_json(sql_obj_li):
    li = []
    for sql_obj in sql_obj_li:
        ret_obj = {}
        imps = get_important_sql_parts(sql_obj)
        for obj in dir(sql_obj):
            if obj in imps:
                ret_obj[obj] = getattr(sql_obj, obj)
        li.append(ret_obj)
    return li


def get_important_sql_parts(sql_obj):
    li = list()
    allowed = [str, int, list, dict, bool, float, datetime.date, datetime.datetime]
    excludes = ['__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__',
                '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__',
                '__mapper__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__',
                '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__table__', '__tablename__', '__weakref__',
                '_decl_class_registry', '_sa_class_manager', '_sa_instance_state', 'metadata', 'query', 'query_class']
    for obj in dir(sql_obj):
        if obj not in excludes and type(getattr(sql_obj, obj)) in allowed:
            li.append(obj)
    return li














from __init__ import request, abort
from flask_sqlalchemy import Pagination


def limited_paginate(query_in, page=None, per_page=None, error_out=True, total_in=None):
    if request:
        if page is None:
            try:
                page = int(request.args.get('page', 1))
            except (TypeError, ValueError):
                if error_out:
                    abort(404)

                page = 1

        if per_page is None:
            try:
                per_page = int(request.args.get('per_page', 20))
            except (TypeError, ValueError):
                if error_out:
                    abort(404)

                per_page = 20
    else:
        if page is None:
            page = 1

        if per_page is None:
            per_page = 20

    if error_out and page < 1:
        abort(404)

    items = query_in.limit(per_page).offset((page - 1) * per_page).all()

    if not items and page != 1 and error_out:
        abort(404)

    # No need to count if we're on the first page and there are fewer
    # items than we expected.
    if page == 1 and len(items) < per_page:
        total = len(items)
    elif total_in:
        total = total_in
    else:
        total = query_in.order_by(None).count()

    return Pagination(query_in, page, per_page, total, items)

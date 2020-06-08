# localhost의 sparta > DanceMatch 의 db 를
# Dance 라는 remote DB > Dance > DanceMatch > Dance_Collection으로 옮기는 과정

from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId 
# ObjectId str 로 바꿔주기

client_server = MongoClient('mongodb+srv://BUMJUN:bjoh1227!!@dancematchcooperation-gkkwx.mongodb.net/test?retryWrites=true&w=majority', 27017)
db = client_server.test

app = Flask(__name__)

# db.dancer.drop();

db.dancers.insert_many(
    [{
        "name" : "SHAWN",
        "genre" : [ "Choreography", "Hip-Hop"],
        "Academy": "ONEMILLIONDANCE",
        "url_1": '<iframe width="560" height="315" src="https://www.youtube.com/embed/E4ge-TIO6RE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_2": '<iframe width="560" height="315" src="https://www.youtube.com/embed/y6Ct0S_3a10" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_3": '<iframe width="560" height="315" src="https://www.youtube.com/embed/2Wtlhk3rQP4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "img" : "https://s3.ap-northeast-2.amazonaws.com/one-m/choreographer-resources/template_c/Shawn/crop/Shawn_04.jpg",
        "Place" : "Seoul"
},
    {
        "name" : "JUNSUNYOO",
        "genre" : [ "Choreography", "Hip-Hop"],
        "Academy": "ONEMILLIONDANCE",
        "url_1": '<iframe width="560" height="315" src="https://www.youtube.com/embed/Xj11GuedXDc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_2": '<iframe width="560" height="315" src="https://www.youtube.com/embed/CNnqHRQvLlo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_3": '<iframe width="560" height="315" src="https://www.youtube.com/embed/NmHrokXI5Io" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "img" : "https://s3.ap-northeast-2.amazonaws.com/one-m/choreographer-resources/template_d/Junsun+Yoo/crop/Junsun_04.jpg",
        "Place" : "Seoul"
    },
    {
        "name" : "KOOSUNGJUNG",
        "genre" : [ "Choreography", "Hip-Hop"],
        "Academy": "ONEMILLIONDANCE",
        "url_1": '<iframe width="560" height="315" src="https://www.youtube.com/embed/9XlA1AVl_XM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_2": '<iframe width="560" height="315" src="https://www.youtube.com/embed/zZp8USkoNYA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "url_3": '<iframe width="560" height="315" src="https://www.youtube.com/embed/4Usksafym40" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        "img" : "https://s3.ap-northeast-2.amazonaws.com/one-m/choreographer-resources/template_b/Koosung+Jung/crop/Koosung_05.jpg",
        "Place" : "Seoul"

    }]
)

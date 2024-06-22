import time
from datetime import datetime
from data.items import EventItem
import json
import scrapy


class MeetupSpider(scrapy.Spider):
    name = "meetup"
    allowed_domains = ["meetup.com"]
    start_urls = [
        "https://www.meetup.com/de-DE/meetup-group-yhythqmx/",
        "https://www.meetup.com/de-DE/friendly-mixed-gender-football/",
        "https://www.meetup.com/de-DE/terrible-football-berlin/",
        "https://www.meetup.com/de-DE/berlin-running/",
        "https://www.meetup.com/de-DE/flinta-running/",
        "https://www.meetup.com/de-DE/mixed-lazy-and-lousy-football/",
        "https://www.meetup.com/de-DE/amateur-football-berlin/",
        "https://www.meetup.com/de-DE/berlin-football/",
        "https://www.meetup.com/de-DE/lazy-football-on-the-grass/",
    ]

    def parse(self, response):
        for node in response.xpath(
            "//script[@type='application/ld+json']/node()"
        ).extract():
            objects = json.loads(node)
            if not isinstance(objects, list):
                objects = [objects]
            for object in objects:
                if object["@type"] == "Event":
                    yield EventItem(
                        id=object["url"],
                        extracted_at=datetime.now().isoformat(),
                        ttl=int(time.time() + 36 * 3600),
                        name=object["name"],
                        url=object["url"],
                        description=object["description"],
                        start_date=object["startDate"],
                        end_date=object["endDate"],
                        event_status=object["eventStatus"],
                        image=object["image"],
                        event_attendance_mode=object["eventAttendanceMode"],
                        location_type=object["location"]["@type"],
                        location_name=object["location"]["name"],
                        location_address_type=object["location"]["address"]["@type"],
                        location_address_address_country=object["location"]["address"][
                            "addressCountry"
                        ],
                        location_address_address_locality=object["location"]["address"][
                            "addressLocality"
                        ],
                        location_address_address_region=object["location"]["address"][
                            "addressRegion"
                        ],
                        location_address_street_address=object["location"]["address"][
                            "streetAddress"
                        ],
                        organizer_type=object["organizer"]["@type"],
                        organizer_name=object["organizer"]["name"],
                        organizer_url=object["organizer"]["url"],
                        performer=object["performer"],
                    )

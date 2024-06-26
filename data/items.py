import scrapy


class EventItem(scrapy.Item):
    id = scrapy.Field()
    extracted_at = scrapy.Field()
    ttl = scrapy.Field()
    name = scrapy.Field()
    url = scrapy.Field()
    description = scrapy.Field()
    start_date = scrapy.Field()
    end_date = scrapy.Field()
    event_status = scrapy.Field()
    image = scrapy.Field()
    event_attendance_mode = scrapy.Field()
    location_type = scrapy.Field()
    location_name = scrapy.Field()
    location_address_type = scrapy.Field()
    location_address_address_country = scrapy.Field()
    location_address_address_locality = scrapy.Field()
    location_address_address_region = scrapy.Field()
    location_address_street_address = scrapy.Field()
    organizer_type = scrapy.Field()
    organizer_name = scrapy.Field()
    organizer_url = scrapy.Field()
    performer = scrapy.Field()

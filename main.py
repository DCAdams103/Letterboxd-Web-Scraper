from bs4 import BeautifulSoup
import urllib3
import random
import math

def find_max_num():
    http = urllib3.PoolManager()
    response = http.request('GET', 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/')
    soup = BeautifulSoup(response.data, 'html.parser')

    max_number = soup.find("div", {'class', 'paginate-pages'})
    last_page = max_number.find_all("li")[4].find("a").text

    url_builder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + last_page + '/'
    response = http.request('GET', url_builder)
    soup = BeautifulSoup(response.data, 'html.parser')

    movie_list = soup.find("ul", {'class', 'js-list-entries'})

    length = 0
    for tag in movie_list.find_all("li"):
        length += 1

    return (int(last_page) * 100) - (100 - length)

def search_page(page_num, rand_num):
    http = urllib3.PoolManager()
    url_builder = 'https://letterboxd.com/tobiasandersen2/list/random-movie-roulette/page/' + str(page_num) + '/'
    response = http.request('GET', url_builder)

    soup = BeautifulSoup(response.data, 'html.parser')
    container = soup.find_all("li", {'class', 'poster-container'})

    for tag in container:
        test = tag.extract()
        if int(test.find("p", {'class', 'list-number'}).text) == rand_num:
            print(tag.find("p", {'class', 'list-number'}).find_previous_sibling().find("img", {'class', 'image'})['alt'])
            return True

    return False

rand_num = random.randint(1, find_max_num())
starting_page = math.floor(rand_num / 100)

if rand_num % 100 != 0:
    starting_page += 1

found = search_page(starting_page, rand_num)

while found == False:
    starting_page += 1
    found = search_page(starting_page, rand_num)

print("number " + str(rand_num) + " on page " + str(starting_page))
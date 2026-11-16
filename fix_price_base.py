import re

filepath = r'd:\LayarTix\customer\js\beranda.js'
content = open(filepath, encoding='utf-8').read()

# Map movie id -> price_base
prices = {
    'm_clayface':       65000,
    'm_kuasagelap':     65000,
    'm_pirunduk':       60000,
    'm_bapakjujur':     60000,
    'm_streetfighter':  65000,
    'm_ibu':            55000,
    'm_sitivampir':     55000,
    'm_othermommy':     60000,
    'm_residentevil':   70000,
    'm_beautifulpain':  55000,
    'm_wargarusan':     60000,
    'm_verity':         65000,
    'm_henryfirstdate': 55000,
    'm_empatmusim':     55000,
}

def add_price_base(m):
    obj_str = m.group(0)
    # Skip if already has price_base
    if 'price_base' in obj_str:
        return obj_str
    # Extract id
    id_match = re.search(r"id:\s*'([^']+)'", obj_str)
    if not id_match:
        return obj_str
    movie_id = id_match.group(1)
    if movie_id not in prices:
        return obj_str
    price = prices[movie_id]
    # Find duration field and insert price_base after it
    # Pattern: duration: NNN,
    new_obj = re.sub(
        r'(duration:\s*\d+),',
        r'\1, price_base: ' + str(price) + ',',
        obj_str,
        count=1
    )
    return new_obj

# Match each object in nowPlayingMovies (single-line objects starting with { id: 'm_...)
content = re.sub(r"\{ id: 'm_[^}]+\}", add_price_base, content)

open(filepath, 'w', encoding='utf-8').write(content)
print('Done. price_base added to nowPlayingMovies.')

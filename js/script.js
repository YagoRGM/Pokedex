const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1;

const fetchPokemon = async (pokemon) => {
  const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    return data;
  }
}

const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading...';
    pokemonNumber.innerHTML = '';
  
    const data = await fetchPokemon(pokemon);
  
    if (data) {
        pokemonImage.style.display = 'block';
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
    
        // Verifica se há sprite animado
        const animatedSprite = data.sprites.versions['generation-v']['black-white'].animated.front_default;
        const defaultSprite = data.sprites.other['official-artwork'].front_default;
    
        // Usa o sprite animado se existir, caso contrário, usa a imagem normal (649 ou superior)
        pokemonImage.src = animatedSprite || defaultSprite;
    
        // Código que usa imagens para todos utilizando o Pokemon Home 
        // pokemonImage.src = data.sprites.other['official-artwork'].front_default;

        // Utiliza sprint animados para todos até o 721, porém alguns sprints podem não estar funcionando, pois a seção ainda esta em construção e o pkparaiso não é uma API
        // pokemonImage.src = `https://www.pkparaiso.com/imagenes/xy/sprites/animados/${data.name}.gif`;

    
    
        input.value = '';
        searchPokemon = data.id;
      } else {
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Not found :c';
        pokemonNumber.innerHTML = '';
      }
  };
  

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
  }
});

buttonNext.addEventListener('click', () => {
  searchPokemon += 1;
  renderPokemon(searchPokemon);
});

renderPokemon(searchPokemon);

document.querySelector('.btn-new-pokedex').addEventListener('click', () => {
  window.location.href = 'pokedex_nova.html';  // Isso levaria para a nova página
});
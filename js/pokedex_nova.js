const fetchGenerationOnePokemons = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/generation/1/');
        const data = await response.json();
        const pokemons = data.pokemon_species;

        renderPokemonList(pokemons);
    } catch (error) {
        console.error('Erro ao buscar os Pokémons:', error);
    }
};

// Cores dos tipos
const getTypeColor = (type) => {
    const colors = {
        fire: "#F08030",
        water: "#6890F0",
        grass: "#78C850",
        electric: "#F8D030",
        ice: "#98D8D8",
        fighting: "#C03028",
        poison: "#A040A0",
        ground: "#E0C068",
        flying: "#A890F0",
        psychic: "#F85888",
        bug: "#A8B820",
        rock: "#B8A038",
        ghost: "#705898",
        dragon: "#7038F8",
        dark: "#705848",
        steel: "#B8B8D0",
        fairy: "#EE99AC",
        normal: "#A8A878"
    };
    return colors[type] || "#A8A878"; // Cor padrão caso o tipo não esteja listado
};

const translateType = (type) => {
    const translations = {
        fire: "Fogo",
        water: "Água",
        grass: "Grama",
        electric: "Elétrico",
        ice: "Gelo",
        fighting: "Lutador",
        poison: "Venenoso",
        ground: "Terra",
        flying: "Voador",
        psychic: "Psíquico",
        bug: "Inseto",
        rock: "Pedra",
        ghost: "Fantasma",
        dragon: "Dragão",
        dark: "Sombrio",
        steel: "Aço",
        fairy: "Fada",
        normal: "Normal"
    };
    return translations[type] || type;
};

// Função para renderizar a lista de Pokémons com imagens, nomes e tipos
const renderPokemonList = async (pokemons) => {
    const container = document.getElementById('pokemon-list');
    if (!container) {
        console.error('Elemento "pokemon-list" não encontrado.');
        return;
    }

    container.innerHTML = '';

    const pokemonDataPromises = pokemons.map(async (pokemon) => {
        try {
            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
            const pokemonData = await pokemonResponse.json();

            const types = pokemonData.types.map(typeInfo => typeInfo.type.name);
            const primaryType = types[0];
            const backgroundColor = getTypeColor(primaryType);

            const translatedTypes = types.map(type => translateType(type)).join(', ');

            const pokemonId = pokemonData.id;
            const pokemonImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

            const pokemonName = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

            return {
                name: pokemonName,
                imageUrl: pokemonImageUrl,
                id: pokemonId,
                types: translatedTypes,
                backgroundColor: backgroundColor,
                weight: pokemonData.weight / 10, // Convertendo para kg
                height: pokemonData.height / 10, // Convertendo para metros
                animatedSprite: pokemonData.sprites.versions['generation-v']['black-white'].animated.front_default,
                defaultSprite: pokemonImageUrl
            };
        } catch (error) {
            console.error(`Erro ao buscar os dados do Pokémon ${pokemon.name}:`, error);
            return null;
        }
    });

    const pokemonData = await Promise.all(pokemonDataPromises);
    const validPokemonData = pokemonData.filter(pokemon => pokemon !== null);

    validPokemonData.sort((a, b) => a.id - b.id);

    validPokemonData.forEach((pokemon) => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('pokemon-item');
        pokemonItem.style.backgroundColor = pokemon.backgroundColor;
        pokemonItem.style.display = "flex";  // Garante que o card siga o layout flexível
        pokemonItem.style.flexDirection = "column"; // Mantém a estrutura interna
    
        pokemonItem.innerHTML = `
            <img src="${pokemon.imageUrl}" alt="${pokemon.name}" class="pokemon-image">
            <h3 class="pokemon-name">${pokemon.name}</h3>
            <p class="pokemon-types">Tipo(s): ${pokemon.types}</p>
        `;
    
        pokemonItem.addEventListener('click', () => openModal(pokemon));
    
        container.appendChild(pokemonItem);
    });
    
};

// Função para abrir o modal
const openModal = (pokemon) => {
    const modal = document.createElement('div');
    modal.classList.add('pokemon-modal');

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.animatedSprite || pokemon.defaultSprite}" alt="${pokemon.name}" class="pokemon-gif">
            <p><strong>Tipo(s):</strong> ${pokemon.types}</p>
            <p><strong>Peso:</strong> ${pokemon.weight} kg</p>
            <p><strong>Altura:</strong> ${pokemon.height} m</p>
        </div>
    `;

    document.body.appendChild(modal);

    // Fechar o modal ao clicar no "X" ou fora dele
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.remove();
    });
};

// CSS para o modal
const style = document.createElement('style');
style.innerHTML = `
    .pokemon-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        position: relative;
        max-width: 400px;
        width: 90%;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
    }

    .pokemon-gif {
        width: 120px;
        height: 120px;
    }
`;
document.head.appendChild(style);

// Espera o DOM carregar e então executa a função
document.addEventListener('DOMContentLoaded', fetchGenerationOnePokemons);

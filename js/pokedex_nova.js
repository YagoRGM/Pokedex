// Função para buscar os Pokémons de uma geração específica
const fetchPokemonsByGeneration = async (generation) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}/`);
        const data = await response.json();
        const pokemons = data.pokemon_species;

        renderPokemonList(pokemons);
    } catch (error) {
        console.error('Erro ao buscar os Pokémons:', error);
    }
};
// Evento de clique nos botões de geração
const generationButtons = document.querySelectorAll('.generation-button');
generationButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const generation = event.target.getAttribute('data-generation');
        fetchPokemonsByGeneration(generation);
        document.querySelector('h1').textContent = `Pokédex da ${generation}ª Geração`;
    });
});

// Filtro de pesquisa de Pokémon
document.getElementById('searchBar').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    let pokemonItems = document.querySelectorAll('.pokemon-item');

    pokemonItems.forEach(item => {
        let name = item.querySelector('.pokemon-name').textContent.toLowerCase();
        let id = item.querySelector('.pokemon-id').textContent.replace('#', '');

        if (name.includes(filter) || id.includes(filter)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

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

            // Pegando a imagem padrão
            const pokemonImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

            // Pegando o GIF animado se existir, caso contrário, será undefined
            const pokemonGifUrl = pokemonData.sprites.versions['generation-v']['black-white'].animated.front_default;

            return {
                name: pokemonData.name,
                imageUrl: pokemonImageUrl,
                gifUrl: pokemonGifUrl || null, // Armazenamos null caso não exista um GIF
                id: pokemonId,
                types: translatedTypes,
                backgroundColor: backgroundColor,
                weight: pokemonData.weight / 10, // Convertendo para kg
                height: pokemonData.height / 10, // Convertendo para metros
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
            <p class="pokemon-id">#${pokemon.id}</p>
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
    modal.style.setProperty('--type-color', pokemon.backgroundColor);
    modal.classList.add('pokemon-modal');

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <!-- Se tiver o GIF, ele será exibido, senão, exibe a imagem padrão -->
            <img src="${pokemon.gifUrl || pokemon.imageUrl}" alt="${pokemon.name}" class="pokemon-gif">
            <h3 class="pokemon-name">• ${pokemon.name} •</h3>
            <div class="pokemon-stats">
                <div class="stat">
                    <img src='./img/height.svg'>
                    <p class="stat-label">Altura</p>
                    <p class="stat-value">${pokemon.height} M</p>
                </div>
                <div class="stat">
                    <img src='./img/weight.svg'>
                    <p class="stat-label">Peso</p>
                    <p class="stat-value">${pokemon.weight} KG</p>
                </div>
                <div class="stat">
                    <p class="stat-label">Tipo</p>
                    <p class="stat-value">${pokemon.types}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal);
    });

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
};

// Função para fechar o modal com animação
const closeModal = (modal) => {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
    }, 300);
};

// CSS atualizado para o modal
const style = document.createElement('style');
style.innerHTML = `
    .pokemon-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        background-color: var(--type-color);
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        position: relative;
        max-width: 400px;
        width: 90%;
        border: 3px solid var(--type-color);
        color: #fff;
        box-shadow: 0px 4px 15px rgba(255, 255, 255, 0.2);
    }

    .pokemon-name {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        text-transform: uppercase;
        margin: 10px 0;
    }

    .pokemon-gif {
        width: 150px;
        height: 150px;
    }

    .pokemon-stats {
        display: flex;
        justify-content: space-around;
        margin-top: 15px;
    }

    .stat {
        text-align: center;
    }

    .stat-value {
        font-size: 18px;
        font-weight: bold;
    }

    .stat-label {
        font-size: 14px;
        color: #aaa;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        font-weight: bold;
        color: #bbb;
        cursor: pointer;
    }

    .close-modal:hover {
        color: var(--type-color);
    }
`;
document.head.appendChild(style);

// Inicializa com a Geração 1
document.addEventListener('DOMContentLoaded', () => fetchPokemonsByGeneration(1));

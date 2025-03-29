let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMONS = 1000;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
                res.json()
            ),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
                res.json()
            ),
        ]);

        const abilitiesWrapper = document.querySelector(
            ".pokemon-detail-wrap .pokemon-detail.move"
        );
        abilitiesWrapper.innerHTML = "";

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent =
                flavorText;

            const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
                document.querySelector(sel)
            );
            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if (id !== 1) {
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                });
            }
            if (id !== 1000) {
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                });
            }

            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }

        return true;
    } catch (error) {
        console.error("An error occured while fetching Pokemon data:", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

// Definição das cores para os tipos
const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
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
    fairy: "#EE99AC", // Corrigido para "fairy"
};

// Define as imagens de fundo para cada tipo de Pokémon
const typeBackgroundImages = {
    grass: "./img/fundo-bulba.jpg",
    fire: "./img/fogo.jpg",
    water: "./img/agua.jpg",
    electric: "./img/fundo-pikachu.jpg",
    // Adicione outras imagens conforme necessário
};

function setTypeBackgroundImage(pokemon) {
    const mainType = pokemon.types[0].type.name;  // Obtém o tipo principal do Pokémon
    const imageSrc = typeBackgroundImages[mainType];  // Obtém a imagem correspondente

    if (!imageSrc) {
        console.warn(`Imagem não definida para o tipo: ${mainType}`);
        return;
    }

    // Seleciona o elemento principal onde a imagem será aplicada
    const detailMainElement = document.querySelector(".detail-main");

    if (detailMainElement) {
        // Define a imagem como fundo usando CSS
        detailMainElement.style.backgroundImage = `url('${imageSrc}')`;
        detailMainElement.style.backgroundSize = "cover";  // Faz com que a imagem cubra toda a área
        detailMainElement.style.backgroundPosition = "center"; // Centraliza a imagem
        detailMainElement.style.backgroundRepeat = "no-repeat"; // Impede repetição da imagem
    } else {
        console.warn("Elemento .detail-main não encontrado.");
    }
}

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`Color not defined for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "borderColor", color);

    setElementStyles(
        document.querySelectorAll(".power-wrapper > p"),
        "backgroundColor",
        color
    );

    setElementStyles(
        document.querySelectorAll(".stats-wrap p.stats"),
        "color",
        color
    );

    setElementStyles(
        document.querySelectorAll(".stats-wrap .progress-bar"),
        "color",
        color
    );

    const rgbaColor = rgbaFromHex(color);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${color};
    }
  `;
    document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => {
        element[key] = options[key];
    });
    parent.appendChild(element);
    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.querySelector("title").textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

    document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.classList.remove("show");

    setTimeout(() => {
        imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        imageElement.alt = name;
        imageElement.classList.add("show");
    }, 100);

    // Resetando o estado do shiny
    let shinyButton = document.querySelector("#shinyButton");
    if (!shinyButton) {
        shinyButton = document.createElement("button");
        shinyButton.id = "shinyButton";
        document.querySelector(".detail-card-detail-wrapper").appendChild(shinyButton);
    }

    let isShiny = false; // 🔥 RESETANDO para corrigir o bug
    shinyButton.textContent = "Ver Shiny";

    shinyButton.onclick = () => {
        isShiny = !isShiny;
        updatePokemonImage(isShiny, id);
        shinyButton.textContent = isShiny ? "Voltar ao Normal" : "Ver Shiny";
    };

    // Atualizando tipos
    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name,
        });
    });

    // Atualizando peso e altura
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10}kg`;
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10}m`;

    // Atualizando habilidades
    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
    abilitiesWrapper.innerHTML = "";
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, "p", {
            className: "body3-fonts",
            textContent: ability.name,
        });
    });

    // Atualizando estatísticas
    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap";
        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts stats",
            textContent: statNameMapping[stat.name],
        });

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts",
            textContent: String(base_stat).padStart(3, "0"),
        });

        createAndAppendElement(statDiv, "progress", {
            className: "progress-bar",
            value: base_stat,
            max: 100,
        });
    });

    
    setTypeBackgroundImage(pokemon);
    setTypeBackgroundColor(pokemon);
}

function updatePokemonImage(isShiny, pokemonId) {
    const imageElement = document.querySelector(".detail-img-wrapper img");

    imageElement.classList.remove("show"); // Reseta a animação

    setTimeout(() => {
        const imageUrl = isShiny
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

        imageElement.src = imageUrl;
        imageElement.classList.add("show"); // Ativa a animação
    }, 100);
}


function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
        if (entry.language.name === "en") {
            let flavor = entry.flavor_text.replace(/\f/g, " ");
            return flavor;
        }
    }
    return "";
}
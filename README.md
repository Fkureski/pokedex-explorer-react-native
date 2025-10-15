````
# Pokédex Explorer (React Native + Expo)

Aplicativo que consome a **PokéAPI** para:
- Listar Pokémons
- Buscar por nome ou id
- Ver detalhes (imagem , nome, número, tipos, habilidades)
- Marcar e ver Pokemons favoritos

## Como rodar
```
npm install
npx expo start
````

* Inicie um emulador Android ou use o app Expo Go no celular.
* No terminal do Expo, pressione "a" (Android) ou escaneie o "QR Code" (celular).

## Tecnologias

* Expo / React Native
* React Navigation (stack)
* Axios
* Context API (+ AsyncStorage para persistir favoritos)

## Estrutura

```
src/
  components/   # SearchBar, PokemonCard, Loader e ErrorView
  context/      # FavoritesContext
  navigation/   # Index (Home, datails e favorites)
  screens/      # HomeScreen, DetailsScreen, FavoritesScreen
  services/     # pokeapi.ts
  types/        # Tipos da PokéAPI
App.tsx
```


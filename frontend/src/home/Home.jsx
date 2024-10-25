import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';
import profileIcon from "./usericon.png";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecipe, setNewRecipe] = useState({ title: '', description: '', ingredients: '' });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      let url = 'http://localhost:8082/recipes';
      if (storedUser) {
        url += `?userId=${storedUser.id}`;
      }

      try {
        const response = await axios.get(url); 
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, []);


  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewRecipe = (id) => {
    navigate(`/recipe/${id}`);
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const handleAddRecipe = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user')); 

    try {
      const response = await axios.post('http://localhost:8082/recipes', {
        ...newRecipe,
        userId: storedUser.id 
      });
      setRecipes([...recipes, response.data]);
      setShowModal(false);
      setNewRecipe({ title: '', description: '', ingredients: '' });
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const addToFavorites = async (recipeId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
        alert("You need to be logged in to add favorites");
        return;
    }

    const isAlreadyFavorite = recipes.some((recipe) => recipe.id === recipeId && recipe.isFavorite);

    if (isAlreadyFavorite) {
        alert("This recipe is already in your favorites!");
        return; 
    }

    try {
        await axios.post('http://localhost:8082/favorites', {
            userId: storedUser.id,
            recipeId: recipeId
        });
        

        setRecipes((prevRecipes) =>
            prevRecipes.map((recipe) =>
                recipe.id === recipeId ? { ...recipe, isFavorite: true } : recipe
            )
        );

        alert("Recipe added to favorites!");
    } catch (error) {
        console.error("Error adding to favorites:", error);
        alert("Failed to add to favorites. Please try again later.");
    }
};


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Cooking Recipes</h1>
  
        <div className={styles.headerActions}>
          <input
            type="text"
            placeholder="Search Recipes..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className={styles.profileIcon} onClick={goToProfile}>
            <img
              src={profileIcon}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
        </div>
      </header>
  
      <section className={styles.recipeList}>
        {filteredRecipes.map((recipe) => (
          <div className={styles.recipeCard} key={recipe.id}>
            <h2 className={styles.recipeTitle}>
              {recipe.title}
              <small className={styles.recipeAuthor}>.{recipe.user_name}</small>
            </h2>
            <button
              className={styles.viewRecipeBtn}
              onClick={() => viewRecipe(recipe.id)}
            >
              View Recipe
            </button>
            <button
              className={styles.addFavoriteBtn}
              onClick={() => addToFavorites(recipe.id)}
            >
              {recipe.isFavorite ? 'Remove favorite' : 'Add to Favorites'}
            </button>
          </div>
        ))}
      </section>
  
      <div
        className={styles.addRecipeBtn}
        onClick={() => {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (!storedUser) {
            alert('You need to be logged in to add a recipe');
            navigate('/login'); 
          } else {
            setShowModal(true); 
          }
        }}
      >
        <button>+</button>
      </div>
  
      {showModal && (
        <>
          <div className={styles.overlay} onClick={() => setShowModal(false)}></div>
          <div className={styles.modal}>
            <h2>Add Recipe</h2>
            <input
              type="text"
              placeholder="Recipe Title"
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
            />
            <textarea
              placeholder="Recipe Description"
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            />
            <textarea
              placeholder="Ingredients (comma separated)"
              value={newRecipe.ingredients}
              onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
            />
            <button onClick={handleAddRecipe}>Submit</button>
            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;


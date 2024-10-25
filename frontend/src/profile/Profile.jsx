import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser) {
      console.error('User not found');
      alert('Login to continue...')
      navigate('/login'); 
      return;
    }
  
    setUser(storedUser); 
  
    const fetchUserRecipes = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/user-recipes?userId=${storedUser.id}`);
        setRecipes(response.data); 
      } catch (error) {
        console.error('Error fetching user recipes:', error);
        alert('Failed to fetch recipes. Please try again later.');
      }
    };
  
    const fetchUserFavorites = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) return;
    
        try {
            const response = await axios.get(`http://localhost:8082/favorites?userId=${storedUser.id}`);
            setFavorites(response.data);
        } catch (error) {
            console.error('Error fetching user favorites:', error);
        }
    };
    
  
    fetchUserRecipes();
    fetchUserFavorites();
  }, []); 
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const viewRecipe = (id) => {
    navigate(`/recipe/${id}`);
  };

  const handleHome =()=>{
    navigate('/');
  };

  const removeFavorite = async (recipeId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser) {
      alert("You need to be logged in to remove favorites");
      return;
    }

    try {
      await axios.delete('http://localhost:8082/favorites', {
        data: { userId: storedUser.id, recipeId: recipeId }
      });

      window.location.reload();

      setFavorites((prevFavorites) =>
        prevFavorites.filter((favorite) => favorite.recipe_id !== recipeId)
      );

      alert("Recipe removed from favorites!");
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const renderRecipeList = (recipeList, isFavoriteList) => {
    if (recipeList.length === 0) {
      return <p>You have not added any recipes yet.</p>;
    }
    return (
      <div className={styles.recipeList}>
        {recipeList.map((recipe) => (
          <div key={recipe.id} className={styles.recipeCard}>
            <h3>{recipe.title}</h3>
            <button className={styles.viewBtn} onClick={() => viewRecipe(recipe.id)}>View Recipe</button>
            {isFavoriteList && (
              <button className={styles.removeBtn} onClick={() => removeFavorite(recipe.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return null; 
  }

  return (
    <div className={styles.profileContainer}>
      <header className={styles.header}>
      <button onClick={handleHome} className={styles.homeBtn}>Home</button>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </header>
      <h1>Welcome, {user.name}!</h1>    

      <h2>Your Recipes</h2>
      {renderRecipeList(recipes, false)}

      <h2>Your Favorites</h2>
      {renderRecipeList(favorites, true)}
    </div>
  );
};

export default Profile;

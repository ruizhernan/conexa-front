import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface DataItem {
  uid?: string;
  name?: string; // Explicitly add name at top level
  title?: string; // Explicitly add title at top level
  properties?: {
    name?: string;
    title?: string;
    director?: string;
    producer?: string;
    release_date?: string;
    episode_id?: number;
    model?: string;
    manufacturer?: string;
    length?: string;
    crew?: string;
    passengers?: string;
    starship_class?: string;
    vehicle_class?: string;
    height?: string;
    mass?: string;
    gender?: string;
    hair_color?: string;
    skin_color?: string;
    eye_color?: string;
    birth_year?: string;
    [key: string]: unknown;
  };
  description?: string;
  [key: string]: unknown;
}

const SESSION_TIMEOUT = 15 * 60 * 1000; 

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('people');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [effectiveSearchTerm, setEffectiveSearchTerm] = useState<string>('');
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [fetchedCategoryData, setFetchedCategoryData] = useState<Map<string, { results: DataItem[], totalPages: number }>>(new Map());

  useEffect(() => {
    console.log('Dashboard component mounted (actual)');
    return () => {
      console.log('Dashboard component unmounted (actual)');
    };
  }, []);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    navigate('/signin');
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(logoutUser, SESSION_TIMEOUT);
  }, [logoutUser]);

  useEffect(() => {
    // Initial setup of the timer
    resetInactivityTimer();

    // Event listeners for user activity
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);

    // Cleanup function
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, [resetInactivityTimer]);

  const categories = ['people', 'films', 'starships', 'vehicles'];

  useEffect(() => {
    console.log('Data fetching useEffect triggered with dependencies:', { category, page, limit, effectiveSearchTerm });
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);

      // Create a unique cache key for the current category, page, and effective search term
      const cacheKey = `${category}-${page}-${effectiveSearchTerm}`;

            // Check if data is already in cache
            if (category !== 'films' && category !== 'starships' && category !== 'vehicles' && fetchedCategoryData.has(cacheKey)) { // Temporarily bypass cache for 'films', 'starships', and 'vehicles'
              const cached = fetchedCategoryData.get(cacheKey);
              if (cached) {
                setData(cached.results);
                setTotalPages(cached.totalPages);
                setLoading(false);
                return;
              }
            }
      
            try {
              const token = localStorage.getItem('jwt_token');
              console.log('Token in localStorage:', token);
              if (!token) {
                console.log('No token found, logging out...');
                logoutUser();
                return;
              }
      
              let url = `http://srv559732.hstgr.cloud:8080/api/v1/${category}?page=${page}&limit=${limit}`;
              if (effectiveSearchTerm) {
                url += `&name=${effectiveSearchTerm}`;
              }
      
              const response = await fetch(url,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
      
              if (!response.ok) {
                if (response.status === 401) {
                  // If token is invalid or expired, logout
                  logoutUser();
                  return;
                }
                throw new Error(`Error fetching ${category} data: ${response.statusText}`);
              }
      
              const result = await response.json();
              let newResults: DataItem[] = result.results || [];
              const newTotalPages = result.totalPages || 1;
      
              if (category === 'people' && newResults.length > 0) {
                const detailedPeoplePromises = newResults.map(async (person) => {
                  let updatedPerson: DataItem = { ...person }; // Start with the original person object
                  if (person.uid) {
                    const detailUrl = `http://srv559732.hstgr.cloud:8080/api/v1/people/${person.uid}`;
                    try {
                      const detailResponse = await fetch(detailUrl, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!detailResponse.ok) {
                        console.error(`Error fetching details for ${person.uid}: ${detailResponse.statusText}`);
                        updatedPerson.properties = updatedPerson.properties || {}; // Ensure properties is an object
                        return updatedPerson;
                      }
                      const detailResult = await detailResponse.json();
                      if (detailResult.result && detailResult.result.properties) {
                        updatedPerson.properties = detailResult.result.properties;
                      } else {
                        updatedPerson.properties = updatedPerson.properties || {}; // Ensure properties is an object
                      }
                    } catch (detailErr) {
                      console.error(`Exception fetching details for ${person.uid}:`, detailErr);
                      updatedPerson.properties = updatedPerson.properties || {}; // Ensure properties is an object
                    }
                  } else {
                    updatedPerson.properties = updatedPerson.properties || {}; // Ensure properties is an object if uid is missing
                  }
                  return updatedPerson;
                });
                newResults = await Promise.all(detailedPeoplePromises);
              } else if (category === 'films' && newResults.length > 0) { // Add detailed fetching for films
                const detailedFilmPromises = newResults.map(async (film) => {
                  let updatedFilm: DataItem = { ...film };
                  if (film.uid) {
                    const detailUrl = `http://srv559732.hstgr.cloud:8080/api/v1/films/${film.uid}`;
                    try {
                      const detailResponse = await fetch(detailUrl, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!detailResponse.ok) {
                        console.error(`Error fetching details for ${film.uid}: ${detailResponse.statusText}`);
                        updatedFilm.properties = updatedFilm.properties || {};
                        return updatedFilm;
                      }
                      const detailResult = await detailResponse.json();
                      if (detailResult.result && detailResult.result.properties) {
                        updatedFilm.properties = detailResult.result.properties;
                      } else {
                        updatedFilm.properties = updatedFilm.properties || {};
                      }
                    } catch (detailErr) {
                      console.error(`Exception fetching details for ${film.uid}:`, detailErr);
                      updatedFilm.properties = updatedFilm.properties || {};
                    }
                  } else {
                    updatedFilm.properties = updatedFilm.properties || {};
                  }
                  return updatedFilm;
                });
                newResults = await Promise.all(detailedFilmPromises);
              } else if (category === 'starships' && newResults.length > 0) { // Add detailed fetching for starships
                const detailedStarshipPromises = newResults.map(async (starship) => {
                  let updatedStarship: DataItem = { ...starship };
                  if (starship.uid) {
                    const detailUrl = `http://srv559732.hstgr.cloud:8080/api/v1/starships/${starship.uid}`;
                    try {
                      const detailResponse = await fetch(detailUrl, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!detailResponse.ok) {
                        console.error(`Error fetching details for ${starship.uid}: ${detailResponse.statusText}`);
                        updatedStarship.properties = updatedStarship.properties || {};
                        return updatedStarship;
                      }
                      const detailResult = await detailResponse.json();
                      if (detailResult.result && detailResult.result.properties) {
                        updatedStarship.properties = detailResult.result.properties;
                      } else {
                        updatedStarship.properties = updatedStarship.properties || {};
                      }
                    } catch (detailErr) {
                      console.error(`Exception fetching details for ${starship.uid}:`, detailErr);
                      updatedStarship.properties = updatedStarship.properties || {};
                    }
                  } else {
                    updatedStarship.properties = updatedStarship.properties || {};
                  }
                  return updatedStarship;
                });
                newResults = await Promise.all(detailedStarshipPromises);
              } else if (category === 'vehicles' && newResults.length > 0) { // Add detailed fetching for vehicles
                const detailedVehiclePromises = newResults.map(async (vehicle) => {
                  let updatedVehicle: DataItem = { ...vehicle };
                  if (vehicle.uid) {
                    const detailUrl = `http://srv559732.hstgr.cloud:8080/api/v1/vehicles/${vehicle.uid}`;
                    try {
                      const detailResponse = await fetch(detailUrl, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!detailResponse.ok) {
                        console.error(`Error fetching details for ${vehicle.uid}: ${detailResponse.statusText}`);
                        updatedVehicle.properties = updatedVehicle.properties || {};
                        return updatedVehicle;
                      }
                      const detailResult = await detailResponse.json();
                      if (detailResult.result && detailResult.result.properties) {
                        updatedVehicle.properties = detailResult.result.properties;
                      } else {
                        updatedVehicle.properties = updatedVehicle.properties || {};
                      }
                    } catch (detailErr) {
                      console.error(`Exception fetching details for ${vehicle.uid}:`, detailErr);
                      updatedVehicle.properties = updatedVehicle.properties || {};
                      }
                  } else {
                    updatedVehicle.properties = updatedVehicle.properties || {};
                  }
                  return updatedVehicle;
                });
                newResults = await Promise.all(detailedVehiclePromises);
              }
      
              setData(newResults);
              setTotalPages(newTotalPages);
      
              // Update the cache
              setFetchedCategoryData(prev => new Map(prev).set(cacheKey, { results: newResults, totalPages: newTotalPages }));
      
            } catch (err: unknown) {
              if (err instanceof Error) {
                setError(err.message);
              } else {
                setError(String(err));
              }
              setData([]);
            } finally {
              setLoading(false);
            }
          };
      
          fetchCategoryData();
        }, [category, page, limit, effectiveSearchTerm, logoutUser]);
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page to 1 for any new search

    if (!searchTerm) {
      // If search term is empty, revert to general category search
      setEffectiveSearchTerm('');
      return;
    }

    const id = parseInt(searchTerm);
    if (!isNaN(id)) {
      // If it's a valid ID, perform search by ID
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          logoutUser();
          return;
        }

        const url = `http://srv559732.hstgr.cloud:8080/api/v1/${category}/${id}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logoutUser();
            return;
          }
          throw new Error(`Error fetching ${category} with ID ${id}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.result) {
          // The detailed response has properties nested under 'result.result.properties'
          // and uid at 'result.result.uid'
          const item: DataItem = {
            uid: result.result.uid,
            description: result.result.description,
            properties: result.result.properties,
          };
          setData([item]); // Display only the fetched item
          setTotalPages(1); // Only one page for a single item
        } else {
          setData([]);
          setTotalPages(1);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    } else {
      // If not a valid ID, perform general search by name (if applicable)
      setEffectiveSearchTerm(searchTerm);
      console.log('Effective search term updated to:', searchTerm);
    }
  };

  const renderTableHeaders = () => {
    if (data.length === 0) return null;

    const firstItem = data[0];
    let headers: string[] = [];

    if (category === 'films') {
      headers = ['uid', 'title', 'director', 'producer', 'release_date', 'episode_id'];
    } else if (category === 'people') {
      headers = ['uid', 'name', 'height', 'mass', 'gender', 'hair_color', 'skin_color', 'eye_color', 'birth_year'];
    } else if (category === 'starships') {
      headers = ['uid', 'name', 'model', 'manufacturer', 'length', 'crew', 'passengers', 'starship_class'];
    } else if (category === 'vehicles') {
      headers = ['uid', 'name', 'model', 'manufacturer', 'length', 'crew', 'passengers', 'vehicle_class']; // Removed cost_in_credits
    } else {
      headers = Object.keys(firstItem);
      headers = headers.filter(
        (header) => !['_id', '__v', 'properties'].includes(header.toLowerCase())
      );
      if (firstItem.properties && firstItem.properties.name !== undefined) {
        headers.unshift('Name');
      }
      if (firstItem.description !== undefined && !headers.includes('description')) {
        headers.push('Description');
      }
    }

    return (
      <tr>
        {headers.map((header) => (
          <th key={header} className="px-4 py-2 text-left text-gray-300 uppercase tracking-wider">
            {header.replace(/_/g, ' ')}
          </th>
        ))}
      </tr>
    );
  };

  const renderTableRows = () => {
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={100} className="px-4 py-2 text-center text-gray-400">
            No data available.
          </td>
        </tr>
      );
    }
    return data.map((item, index) => {
      const rowData: Record<string, unknown> = {};

      if (category === 'films') {
        rowData.uid = item.uid;
        rowData.title = item.properties?.title || item.title;
        rowData.director = item.properties?.director;
        rowData.producer = item.properties?.producer;
        rowData.release_date = item.properties?.release_date;
        rowData.episode_id = item.properties?.episode_id;
      } else if (category === 'people') {
        rowData.uid = item.uid;
        rowData.name = item.properties?.name || item.name;
        rowData.height = item.properties?.height;
        rowData.mass = item.properties?.mass;
        rowData.gender = item.properties?.gender;
        rowData.hair_color = item.properties?.hair_color;
        rowData.skin_color = item.properties?.skin_color;
        rowData.eye_color = item.properties?.eye_color;
        rowData.birth_year = item.properties?.birth_year;
      } else if (category === 'starships') {
        rowData.uid = item.uid;
        rowData.name = item.properties?.name || item.name;
        rowData.model = item.properties?.model;
        rowData.manufacturer = item.properties?.manufacturer;
        rowData.length = item.properties?.length;
        rowData.crew = item.properties?.crew;
        rowData.passengers = item.properties?.passengers;
        rowData.starship_class = item.properties?.starship_class;
      } else if (category === 'vehicles') {
        rowData.uid = item.uid;
        rowData.name = item.properties?.name || item.name;
        rowData.model = item.properties?.model;
        rowData.manufacturer = item.properties?.manufacturer;
        rowData.length = item.properties?.length;
        rowData.crew = item.properties?.crew;
        rowData.passengers = item.properties?.passengers;
        rowData.vehicle_class = item.properties?.vehicle_class;
      } else {
        if (item.properties && item.properties.name !== undefined) {
          rowData.Name = item.properties.name;
        }

        Object.keys(item).forEach((key) => {
          if (
            !['_id', '__v', 'properties'].includes(key.toLowerCase()) &&
            item[key] !== undefined
          ) {
            rowData[key] = item[key];
          }
        });
      }

      return (
        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
          {Object.values(rowData).map((value, idx) => (
            <td key={idx} className="px-4 py-2 whitespace-nowrap text-gray-200">
              {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
            </td>
          ))}
        </tr>
      );
    });
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger menu button for small screens */}
      <button className="hamburger-menu-button" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h3 className="sidebar-title">Categories</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat} className={category === cat ? 'active' : ''}>
              <button onClick={() => { setCategory(cat); setPage(1); setIsSidebarOpen(false); }}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        {/* Logout Button */}
        <div className="sidebar-logout">
          <button onClick={logoutUser} className="sidebar-logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header with Search */}
        <div className="dashboard-header">
          <h2 className="dashboard-title">Star Wars Data</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search by ID</button>
          </form>
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          {loading && <p className="message">Loading data...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  {renderTableHeaders()}
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
const BASE_URL = 'http://localhost:5000/api';

async function runQualityCheck() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPLETE 22-STEP FINAL QUALITY CHECK');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // --- FLOW 1: NORMAL USER LIFECYCLE ---
  console.log('\n--- PHASE 1: NORMAL USER LIFECYCLE ---');
  
  const testEmail = `newuser_${Date.now()}@example.com`;
  let normalUserToken = '';
  let normalUserId = null;
  let testStoreId = null;
  let submittedRatingId = null;

  // Step 1: Register Normal User
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Benjamin Franklin Rodriguez Jr',
        email: testEmail,
        address: '1024 Silicon Valley Expressway, Building 4A, Tech Hub',
        password: 'User@Secure123',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.data?.token, '1. Register Normal User');
    normalUserToken = regData.data?.token;
    normalUserId = regData.data?.user?.id;
  } catch (err) {
    assert(false, `1. Register Normal User (Error: ${err.message})`);
  }

  // Step 2: Login as Normal User
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'User@Secure123',
      }),
    });
    const loginData = await loginRes.json();
    assert(
      loginRes.status === 200 && loginData.data?.user?.role === 'user',
      '2. Login as Normal User'
    );
    normalUserToken = loginData.data?.token;
  } catch (err) {
    assert(false, `2. Login as Normal User (Error: ${err.message})`);
  }

  // Step 3: View stores
  try {
    const storesRes = await fetch(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${normalUserToken}` },
    });
    const storesData = await storesRes.json();
    assert(
      storesRes.status === 200 && Array.isArray(storesData.data?.stores) && storesData.data.stores.length > 0,
      `3. View stores (Found ${storesData.data?.stores?.length || 0} stores)`
    );
    testStoreId = storesData.data?.stores?.[0]?.id;
  } catch (err) {
    assert(false, `3. View stores (Error: ${err.message})`);
  }

  // Step 4: Search stores
  try {
    const searchRes = await fetch(`${BASE_URL}/stores?search=Apex`, {
      headers: { Authorization: `Bearer ${normalUserToken}` },
    });
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 && searchData.data?.stores?.some((s) => s.name.includes('Apex')),
      '4. Search stores by query "Apex"'
    );
  } catch (err) {
    assert(false, `4. Search stores (Error: ${err.message})`);
  }

  // Step 5: Submit rating
  try {
    const rateRes = await fetch(`${BASE_URL}/stores/${testStoreId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalUserToken}`,
      },
      body: JSON.stringify({ rating: 4 }),
    });
    const rateData = await rateRes.json();
    assert(
      rateRes.status === 201 && rateData.data?.rating?.rating === 4,
      '5. Submit rating (4 Stars) to store #' + testStoreId
    );
    submittedRatingId = rateData.data?.rating?.id;
  } catch (err) {
    assert(false, `5. Submit rating (Error: ${err.message})`);
  }

  // Step 6: Modify rating
  try {
    const modRes = await fetch(`${BASE_URL}/stores/${testStoreId}/ratings/${submittedRatingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalUserToken}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    const modData = await modRes.json();
    assert(
      modRes.status === 200 && modData.data?.newRating === 5,
      '6. Modify rating (from 4 to 5 Stars)'
    );
  } catch (err) {
    assert(false, `6. Modify rating (Error: ${err.message})`);
  }

  // Step 7: Logout
  try {
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${normalUserToken}` },
    });
    assert(logoutRes.status === 200, '7. Logout Normal User');
  } catch (err) {
    assert(false, `7. Logout (Error: ${err.message})`);
  }

  // --- FLOW 2: STORE OWNER LIFECYCLE ---
  console.log('\n--- PHASE 2: STORE OWNER LIFECYCLE ---');

  let ownerToken = '';
  let ownerId = null;

  // Step 8: Login as Store Owner
  try {
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner1@example.com',
        password: 'Owner@1234',
      }),
    });
    const ownerLoginData = await ownerLoginRes.json();
    assert(
      ownerLoginRes.status === 200 && ownerLoginData.data?.user?.role === 'owner',
      '8. Login as Store Owner (owner1@example.com)'
    );
    ownerToken = ownerLoginData.data?.token;
    ownerId = ownerLoginData.data?.user?.id;
  } catch (err) {
    assert(false, `8. Login as Store Owner (Error: ${err.message})`);
  }

  // Step 9: View average rating
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard/store-owner`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const dashData = await dashRes.json();
    assert(
      dashRes.status === 200 &&
        dashData.data?.hasStore === true &&
        typeof dashData.data?.stats?.averageRating === 'number',
      `9. View average rating (Store: "${dashData.data?.store?.name}", Average: ${dashData.data?.stats?.averageRating} ★)`
    );
  } catch (err) {
    assert(false, `9. View average rating (Error: ${err.message})`);
  }

  // Step 10: View users who rated the store
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard/store-owner?sortBy=created_at&sortOrder=desc`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const dashData = await dashRes.json();
    assert(
      dashRes.status === 200 &&
        Array.isArray(dashData.data?.ratings) &&
        dashData.data.ratings.length > 0 &&
        dashData.data.ratings[0].user_name,
      `10. View users who rated the store (Found ${dashData.data?.ratings?.length} customer reviews)`
    );
  } catch (err) {
    assert(false, `10. View users who rated the store (Error: ${err.message})`);
  }

  // Step 11: Change password
  try {
    const passRes = await fetch(`${BASE_URL}/users/${ownerId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Owner@1234',
        newPassword: 'Owner@New5678',
        confirmPassword: 'Owner@New5678',
      }),
    });
    assert(passRes.status === 200, '11. Change password for Store Owner');

    // Revert back so demo seed credentials remain consistent for user
    await fetch(`${BASE_URL}/users/${ownerId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Owner@New5678',
        newPassword: 'Owner@1234',
        confirmPassword: 'Owner@1234',
      }),
    });
  } catch (err) {
    assert(false, `11. Change password (Error: ${err.message})`);
  }

  // Step 12: Logout
  try {
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(logoutRes.status === 200, '12. Logout Store Owner');
  } catch (err) {
    assert(false, `12. Logout (Error: ${err.message})`);
  }

  // --- FLOW 3: SYSTEM ADMINISTRATOR LIFECYCLE ---
  console.log('\n--- PHASE 3: SYSTEM ADMINISTRATOR LIFECYCLE ---');

  let adminToken = '';
  let createdUserId = null;
  let createdStoreId = null;

  // Step 13: Login as Admin
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'Admin@123',
      }),
    });
    const adminData = await adminLoginRes.json();
    assert(
      adminLoginRes.status === 200 && adminData.data?.user?.role === 'admin',
      '13. Login as Admin (admin@storerating.com)'
    );
    adminToken = adminData.data?.token;
  } catch (err) {
    assert(false, `13. Login as Admin (Error: ${err.message})`);
  }

  // Step 14: View dashboard statistics
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    const stats = dashData.data?.stats;
    assert(
      dashRes.status === 200 &&
        stats.totalUsers > 0 &&
        stats.totalStores > 0 &&
        stats.totalRatings > 0,
      `14. View dashboard statistics (Users: ${stats?.totalUsers}, Stores: ${stats?.totalStores}, Ratings: ${stats?.totalRatings})`
    );
  } catch (err) {
    assert(false, `14. View dashboard statistics (Error: ${err.message})`);
  }

  // Step 15: Add user
  try {
    const newUserRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Katherine Eleanor Vance-Archer',
        email: `newowner_${Date.now()}@example.com`,
        password: 'Owner@1234',
        address: '888 Commerce Center Parkway, Suite 100',
        role: 'owner',
      }),
    });
    const newUserData = await newUserRes.json();
    assert(
      newUserRes.status === 201 && newUserData.data?.user?.id,
      '15. Add user (New Store Owner: Katherine Eleanor Vance-Archer)'
    );
    createdUserId = newUserData.data?.user?.id;
  } catch (err) {
    assert(false, `15. Add user (Error: ${err.message})`);
  }

  // Step 16: Add store
  try {
    const newStoreRes = await fetch(`${BASE_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Vance Artisanal Gourmet Bakery',
        email: `bakery_${Date.now()}@example.com`,
        address: '888 Commerce Center Parkway, Shop 2',
        owner_id: createdUserId,
      }),
    });
    const newStoreData = await newStoreRes.json();
    assert(
      newStoreRes.status === 201 && newStoreData.data?.store?.id,
      '16. Add store ("Vance Artisanal Gourmet Bakery")'
    );
    createdStoreId = newStoreData.data?.store?.id;
  } catch (err) {
    assert(false, `16. Add store (Error: ${err.message})`);
  }

  // Step 17: View users
  try {
    const usersRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    assert(
      usersRes.status === 200 && Array.isArray(usersData.data?.users) && usersData.data.users.length > 0,
      `17. View users (Total returned: ${usersData.data?.pagination?.total})`
    );
  } catch (err) {
    assert(false, `17. View users (Error: ${err.message})`);
  }

  // Step 18: View stores
  try {
    const storesRes = await fetch(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const storesData = await storesRes.json();
    assert(
      storesRes.status === 200 && Array.isArray(storesData.data?.stores) && storesData.data.stores.length > 0,
      `18. View stores (Total returned: ${storesData.data?.pagination?.total})`
    );
  } catch (err) {
    assert(false, `18. View stores (Error: ${err.message})`);
  }

  // Step 19: Filter users
  try {
    const filteredRes = await fetch(`${BASE_URL}/users?role=owner`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filteredData = await filteredRes.json();
    const allOwners = filteredData.data?.users?.every((u) => u.role === 'owner');
    assert(
      filteredRes.status === 200 && allOwners && filteredData.data?.users?.length > 0,
      `19. Filter users by role "owner" (${filteredData.data?.users?.length} owners found)`
    );
  } catch (err) {
    assert(false, `19. Filter users (Error: ${err.message})`);
  }

  // Step 20: Sort tables
  try {
    const sortedRes = await fetch(`${BASE_URL}/stores?sortBy=name&sortOrder=asc`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const sortedData = await sortedRes.json();
    const names = sortedData.data?.stores?.map((s) => s.name);
    const isSorted = names.slice(1).every((item, i) => names[i].localeCompare(item) <= 0);
    assert(
      sortedRes.status === 200 && isSorted,
      '20. Sort tables (Stores sorted ascending by name)'
    );
  } catch (err) {
    assert(false, `20. Sort tables (Error: ${err.message})`);
  }

  // Step 21: View user details (and verify Store Owner details include store rating)
  try {
    const targetId = ownerId || 4;
    const ownerDetailRes = await fetch(`${BASE_URL}/users/${targetId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const ownerDetailData = await ownerDetailRes.json();
    const userDetail = ownerDetailData.data?.user;
    assert(
      ownerDetailRes.status === 200 &&
        userDetail?.role === 'owner' &&
        userDetail?.store &&
        typeof userDetail.store.average_rating === 'number',
      `21. View user details (Store Owner #${userDetail?.id} displays store "${userDetail?.store?.name}" with rating ${userDetail?.store?.average_rating} ★)`
    );
  } catch (err) {
    assert(false, `21. View user details (Error: ${err.message})`);
  }

  // Step 22: Logout
  try {
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(logoutRes.status === 200, '22. Logout Admin');
  } catch (err) {
    assert(false, `22. Logout (Error: ${err.message})`);
  }

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED (Total 22 Tests)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQualityCheck();

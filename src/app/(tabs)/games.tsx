import React from 'react';
import { Redirect } from 'expo-router';
export default function LegacyGames() { return <Redirect href={'/arcade' as any} />; }

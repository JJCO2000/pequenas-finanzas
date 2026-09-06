import React from 'react';
import { Redirect } from 'expo-router';
export default function LegacyMap() { return <Redirect href={'/play' as any} />; }

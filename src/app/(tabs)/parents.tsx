import React from 'react';
import { Redirect } from 'expo-router';
export default function LegacyParents() { return <Redirect href={'/parents' as any} />; }

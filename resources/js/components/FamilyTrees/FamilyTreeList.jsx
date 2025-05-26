import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import familyTreeService from '@/features/FamilyTree/services/familyTreeService';

export default function FamilyTreeList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trees, setTrees] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    search: '',
    privacy: '',
    sortBy: 'created_at',
    sortDir: 'desc',
  });

  // Fetch trees on mount and when filters change
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await familyTreeService.getTreesWithMembers(filters);
        setTrees(response.data);
        setMeta(response.meta);
        
      } catch (err) {
        console.error('Error fetching family trees:', err);
        setError('Failed to load family trees. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrees();
  }, [filters]);
  
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };
  
  const handlePrivacyChange = (privacy) => {
    setFilters(prev => ({ ...prev, privacy, page: 1 }));
  };
  
  const handleSortChange = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };
  
  const handlePerPageChange = (perPage) => {
    setFilters(prev => ({ ...prev, perPage: Number(perPage), page: 1 }));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Family Trees</h1>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Search family trees..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <Select
          value={filters.privacy}
          onValueChange={handlePrivacyChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Privacy setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.perPage}
          onValueChange={handlePerPageChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Trees table */}
          {trees.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No family trees found. Try adjusting your search criteria.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {trees.map(tree => (
                <Card key={tree.id}>
                  <CardHeader>
                    <CardTitle>{tree.name}</CardTitle>
                    <CardDescription>{tree.description || 'No description'}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Privacy:</span> 
                        <span className="ml-2 capitalize">{tree.privacy}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Created by:</span> 
                        <span className="ml-2">{tree.creator?.name || tree.creator?.email || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Members:</span> 
                        <span className="ml-2">{tree.member_count || tree.members?.length || 0}</span>
                      </div>
                    </div>
                    
                    {tree.members && tree.members.length > 0 && (
                      <Table>
                        <TableCaption>Members of {tree.name}</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tree.members.map(member => (
                            <TableRow key={member.id}>
                              <TableCell>{member.user?.name || 'No name'}</TableCell>
                              <TableCell>{member.user?.email}</TableCell>
                              <TableCell>{member.role}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      Created {new Date(tree.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="outline">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Pagination */}
              {meta.last_page > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (meta.current_page > 1) {
                            handlePageChange(meta.current_page - 1);
                          }
                        }}
                        className={meta.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {[...Array(meta.last_page)].map((_, index) => {
                      const page = index + 1;
                      // Show current page and adjacent pages
                      if (
                        page === 1 ||
                        page === meta.last_page ||
                        Math.abs(page - meta.current_page) <= 1
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === meta.current_page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Add ellipsis for gaps
                      if (
                        (page === 2 && meta.current_page > 3) ||
                        (page === meta.last_page - 1 && meta.current_page < meta.last_page - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (meta.current_page < meta.last_page) {
                            handlePageChange(meta.current_page + 1);
                          }
                        }}
                        className={meta.current_page >= meta.last_page ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

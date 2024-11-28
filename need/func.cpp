#include "func.hpp"
#include <iostream>
#include <iomanip>
#include <vector>
#include <cmath>

void SwapSort(std::vector<int> &mas, int lenn){
    for (int i = 0; i < lenn-1; i++){
        for (int j = i+1; j < lenn; j++){
            if (mas[i] > mas[j]){
                int tmp = mas[i];
                mas[i] = mas[j];
                mas[j] = tmp;
            }
        }
    }
}

void BubbleSort(std::vector<int> &mas, int lenn){
    while (lenn--){
        bool flag = false;
        for (int i = 0; i < lenn; i++){
            if (mas[i] > mas[i+1]){
                int tmp = mas[i];
                mas[i] = mas[i+1];
                mas[i+1] = tmp;
                flag = true;
            }
        }
        if (flag == false){
            break;
        }
    }
}

void ShellSort(std::vector<int> &mas, int lenn){
    for (int i = lenn/2; i > 0; i /= 2){
        for(int j = i; j < lenn; j++){
            int key = j;
            while(key >= i && mas[key - i] > mas[j]){
                std::swap(mas[key], mas[key - i]);
                key -= i;
            }
        }
    }
}


/* int partition(vector<int> &vec, int low, int high) {

    // Selecting last element as the pivot
    int pivot = vec[high];

    // Index of elemment just before the last element
    // It is used for swapping
    int i = (low - 1);

    for (int j = low; j <= high - 1; j++) {

        // If current element is smaller than or
        // equal to pivot
        if (vec[j] <= pivot) {
            i++;
            swap(vec[i], vec[j]);
        }
    }

    // Put pivot to its position
    swap(vec[i + 1], vec[high]);

    // Return the point of partition
    return (i + 1);
}

void quickSort(vector<int> &vec, int low, int high) {

    // Base case: This part will be executed till the starting
    // index low is lesser than the ending index high
    if (low < high) {

        // pi is Partitioning Index, arr[p] is now at
        // right place
        int pi = partition(vec, low, high);

        // Separately sort elements before and after the
        // Partition Index pi
        quickSort(vec, low, pi - 1);
        quickSort(vec, pi + 1, high);
    }
} */


void CountSort(std::vector<int> &mas, int lenn){
    int mmax = 0; 
    for (int i = 0; i < lenn; i++){
        mmax = std::max(mmax, mas[i]);
    }
    std::vector<int> dop(mmax+1);
    
}
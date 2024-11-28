#include <iostream>
#include "func.hpp"
#include <fstream>
#include <vector>

using namespace std;
int main(){
    int counter = 0;
    ifstream text("tesst.txt");
    vector<int> mas(1000);
    while(!text.eof()){
        text >> mas[counter];
        counter++;
    }
    int counter1 = counter;
    mas.resize(counter);
    mas.shrink_to_fit();
// Сортировка обменом
    //SwapSort(mas, counter);
// Сортировка пузырьком
    //BubbleSort(mas, counter);
// Сортировка Шелла
    //ShellSort(mas, counter);
// Сортировка быстрая

// Сортировка слиянием

// Сортировка подсчётом

// Сортировка кучей
    for (int i = 0; i < counter1; i++){
        cout << mas[i] << endl;
    }
    text.close();
    return 0;
}